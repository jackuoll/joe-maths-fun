# Composites src/game/mapLayout.json into one PNG using the SAME math the CSS map
# uses (center at x%/y%, width w% of map, height from natural aspect, anchored by
# translate(-50%,-50%)). Prints clash warnings for POI base footprints overlapping
# each other or water. Output: .ref/compose.png
Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot
$mapDir = Join-Path $root "public\map"
$layout = Get-Content (Join-Path $root "src\game\mapLayout.json") -Raw | ConvertFrom-Json

$titles = @{
  meadow="Sunny Meadow"; orchard="Apple Orchard"; bridge="Rolling River";
  cave="Crystal Cave"; peak="Frosty Peak"; castle="Star Castle"
}

$CW = 1400
$CH = [int]($CW * $layout.aspect[1] / $layout.aspect[0])
$canvas = New-Object System.Drawing.Bitmap($CW, $CH)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = 'HighQualityBicubic'
$g.SmoothingMode = 'AntiAlias'

$script:dimCache = @{}
function Dim($name) {
  if (-not $script:dimCache.ContainsKey($name)) {
    $i = [System.Drawing.Image]::FromFile((Join-Path $mapDir $name))
    $script:dimCache[$name] = [pscustomobject]@{ w=[double]$i.Width; h=[double]$i.Height }
    $i.Dispose()
  }
  $script:dimCache[$name]
}
# pixel rect for a sprite at x%,y%,w% (center-anchored, height from aspect)
function Rect($x,$y,$w,$img) {
  $d = Dim $img
  $pw = [double]$w/100.0*$CW
  $ph = $pw * $d.h / $d.w
  $cx = [double]$x/100.0*$CW; $cy = [double]$y/100.0*$CH
  [pscustomobject]@{ l=($cx-$pw/2); t=($cy-$ph/2); w=$pw; h=$ph }
}
function DrawSprite($x,$y,$w,$img,$flip,$opacity) {
  $r = Rect $x $y $w $img
  $src = [System.Drawing.Image]::FromFile((Join-Path $mapDir $img))
  $il=[int]$r.l; $it=[int]$r.t; $iw=[int]$r.w; $ih=[int]$r.h
  if ($flip) { $g.TranslateTransform([float]($r.l*2+$r.w),0); $g.ScaleTransform(-1,1) }
  if ($opacity -and [double]$opacity -lt 1) {
    $dest = New-Object System.Drawing.Rectangle($il,$it,$iw,$ih)
    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $cm = New-Object System.Drawing.Imaging.ColorMatrix
    $cm.Matrix33 = [float]$opacity
    $attr.SetColorMatrix($cm)
    $g.DrawImage($src,$dest,0,0,$src.Width,$src.Height,[System.Drawing.GraphicsUnit]::Pixel,$attr)
  } else {
    $g.DrawImage($src,[int]$il,[int]$it,[int]$iw,[int]$ih)
  }
  $g.ResetTransform()
  $src.Dispose()
}

# bg
DrawSprite 50 50 100 $layout.bg $false 1
# ground patches + water
foreach ($s in $layout.ground) { DrawSprite $s.x $s.y $s.w $s.img $s.flip $s.o }

# road through POIs (Catmull-Rom)
$pts = $layout.pois | ForEach-Object { @{ x=$_.x/100.0*$CW; y=$_.y/100.0*$CH } }
$road = New-Object System.Drawing.Drawing2D.GraphicsPath
for ($i=0; $i -lt $pts.Count-1; $i++) {
  $p0=$pts[[Math]::Max(0,$i-1)]; $p1=$pts[$i]; $p2=$pts[$i+1]; $p3=$pts[[Math]::Min($pts.Count-1,$i+2)]
  $c1x=$p1.x+($p2.x-$p0.x)/6; $c1y=$p1.y+($p2.y-$p0.y)/6
  $c2x=$p2.x-($p3.x-$p1.x)/6; $c2y=$p2.y-($p3.y-$p1.y)/6
  $road.AddBezier($p1.x,$p1.y,$c1x,$c1y,$c2x,$c2y,$p2.x,$p2.y)
}
$penBase = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120,90,70,40), 14); $penBase.StartCap='Round'; $penBase.EndCap='Round'; $penBase.LineJoin='Round'
$penTop  = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220,231,211,164), 8); $penTop.StartCap='Round'; $penTop.EndCap='Round'; $penTop.LineJoin='Round'
$g.DrawPath($penBase,$road); $g.DrawPath($penTop,$road)

# props (mountains, forests, trees)
foreach ($s in $layout.props) { DrawSprite $s.x $s.y $s.w $s.img $s.flip $s.o }

# POIs + snow + ribbon
$ribbon = [System.Drawing.Image]::FromFile((Join-Path $mapDir "ribbon.png"))
$titleFont = New-Object System.Drawing.Font("Arial Black", 13, [System.Drawing.FontStyle]::Bold)
$fmt = New-Object System.Drawing.StringFormat; $fmt.Alignment='Center'; $fmt.LineAlignment='Center'
foreach ($p in $layout.pois) {
  DrawSprite $p.x $p.y $p.w $p.img $false 1
  # ribbon under POI
  $r = Rect $p.x $p.y $p.w $p.img
  $rw = $r.w*1.55; $rh = $rw*256/895
  $rx = ($r.l+$r.w/2)-$rw/2; $ry = $r.t+$r.h*0.92
  $g.DrawImage($ribbon,[int]$rx,[int]$ry,[int]$rw,[int]$rh)
  $tr = New-Object System.Drawing.RectangleF($rx,($ry-$rh*0.06),$rw,$rh)
  $g.DrawString($titles[$p.id], $titleFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(58,44,28))), $tr, $fmt)
}
DrawSprite $layout.compass.x $layout.compass.y $layout.compass.w "compass.png" $false 0.9

$out = Join-Path $root ".ref\compose.png"
$canvas.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $canvas.Dispose()

# ---- clash report: POI base footprints vs each other and vs water ----
function BaseBox($p) {  # building footprint ~ bottom-center 60% wide, 45% tall
  $r = Rect $p.x $p.y $p.w $p.img
  $bw=$r.w*0.6; $bh=$r.h*0.45
  @{ id=$p.id; l=$r.l+($r.w-$bw)/2; t=$r.t+$r.h-$bh; r=$r.l+($r.w+$bw)/2; b=$r.t+$r.h }
}
function Overlap($a,$b) {
  $ix=[Math]::Max(0,[Math]::Min($a.r,$b.r)-[Math]::Max($a.l,$b.l))
  $iy=[Math]::Max(0,[Math]::Min($a.b,$b.b)-[Math]::Max($a.t,$b.t))
  $ix*$iy
}
$boxes = $layout.pois | ForEach-Object { BaseBox $_ }
"=== POI clash report ==="
for ($i=0;$i -lt $boxes.Count;$i++){
  for($j=$i+1;$j -lt $boxes.Count;$j++){
    if ((Overlap $boxes[$i] $boxes[$j]) -gt 0) { "  CLASH: $($boxes[$i].id) <-> $($boxes[$j].id)" }
  }
}
# POI base vs water sprites
$waterImgs = @("river1.png","river2.png","river3.png","lake.png","lake-big.png")
foreach ($p in $layout.pois) {
  if ($p.id -eq 'bridge') { continue }  # bridge is meant to be on water
  $pb = BaseBox $p
  foreach ($s in $layout.ground) {
    if ($waterImgs -contains $s.img) {
      $wr = Rect $s.x $s.y $s.w $s.img
      $wb = @{ l=$wr.l; t=$wr.t; r=$wr.l+$wr.w; b=$wr.t+$wr.h }
      if ((Overlap $pb $wb) -gt 0) { "  IN-WATER?: $($p.id) overlaps $($s.img)" }
    }
  }
}
"saved $out  (${CW}x${CH})"