// ---------------------------------------------------------------------------
// The maths engine: builds long-addition / long-subtraction problems and breaks
// them into column-by-column steps (right -> left) with carries and borrows.
// Each step carries the exact teaching prompt the child sees.
// ---------------------------------------------------------------------------

const PLACES = ['ones', 'tens', 'hundreds', 'thousands']

const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const digits = (n, len) => String(n).padStart(len, '0').split('').map(Number)

// ---- step builders ---------------------------------------------------------

function addSteps(a, b) {
  const len = Math.max(String(a).length, String(b).length)
  const A = digits(a, len), B = digits(b, len)
  const steps = []
  let carry = 0
  for (let p = 0; p < len; p++) {
    const ci = len - 1 - p
    const da = A[ci], db = B[ci]
    const total = da + db + carry
    const result = total % 10
    const carryOut = total >= 10 ? 1 : 0
    const carriedNote = carry ? ` + ${carry} carried` : ''
    steps.push({
      op: '+', place: PLACES[p], ci, gridCol: ci + 1,
      da, db, carryIn: carry, result, carryOut, total, tens: Math.floor(total / 10),
      prompt: `Add the ${PLACES[p]}:  ${da} + ${db}${carriedNote} = ?`,
      reveal: carryOut
        ? `${da} + ${db}${carriedNote} = ${total}! The 1 carries up. ➜`
        : `${da} + ${db}${carriedNote} = ${result}`,
    })
    carry = carryOut
  }
  if (carry > 0) {
    steps.push({
      op: '+', place: PLACES[len], ci: -1, gridCol: 0,
      result: 1, leading: true,
      prompt: `Bring down the carried 1`,
      reveal: `The carried 1 comes down`,
    })
  }
  return { steps, len, gridCols: len + 1 }
}

function subSteps(a, b) {
  const len = Math.max(String(a).length, String(b).length)
  const A = digits(a, len), B = digits(b, len)
  const steps = []
  let borrow = 0
  for (let p = 0; p < len; p++) {
    const ci = len - 1 - p
    const da = A[ci], db = B[ci]
    const top = da - borrow            // top digit after any borrow taken from it
    const need = top < db
    const result = need ? top + 10 - db : top - db
    const borrowOut = need ? 1 : 0
    const shownTop = need ? top + 10 : top
    const borrowedNote = borrow ? ` (became ${top} after borrowing)` : ''
    steps.push({
      op: '-', place: PLACES[p], ci, gridCol: ci,
      da, db, borrowIn: borrow, result, borrowOut, need, top, shownTop,
      prompt: need
        ? `${PLACES[p]}: ${top} − ${db} is too small — borrow 10 to make ${shownTop} − ${db}`
        : `Subtract the ${PLACES[p]}:  ${top} − ${db}${borrowedNote}`,
      reveal: `${shownTop} − ${db} = ${result}`,
    })
    borrow = borrowOut
  }
  return { steps, len, gridCols: len }
}

// ---- problem generators per stage spec -------------------------------------

function genAddNoCarry(len) {
  const A = [], B = []
  for (let i = 0; i < len; i++) {
    const lead = i === 0
    const da = lead ? rint(1, 8) : rint(0, 9)
    const db = lead ? rint(1, 9 - da) : rint(0, 9 - da)
    A.push(da); B.push(db)
  }
  return [Number(A.join('')), Number(B.join(''))]
}

function genAddCarry(len) {
  const lo = 10 ** (len - 1), hi = 10 ** len - 1
  let a, b, guard = 0
  do {
    a = rint(lo, hi); b = rint(lo, hi)
    guard++
  } while (!hasCarry(a, b) && guard < 200)
  return [a, b]
}

function hasCarry(a, b) {
  const len = Math.max(String(a).length, String(b).length)
  const A = digits(a, len), B = digits(b, len)
  let carry = 0
  for (let ci = len - 1; ci >= 0; ci--) {
    const t = A[ci] + B[ci] + carry
    carry = t >= 10 ? 1 : 0
    if (carry) return true
  }
  return false
}

function genSubNoBorrow(len) {
  const A = [], B = []
  for (let i = 0; i < len; i++) {
    const lead = i === 0
    const da = lead ? rint(2, 9) : rint(0, 9)
    const db = lead ? rint(1, da) : rint(0, da)
    A.push(da); B.push(db)
  }
  return [Number(A.join('')), Number(B.join(''))]
}

// No-zero in any column above the ones place keeps every borrow a simple
// "make the neighbour one less" — no confusing cascade through a 0.
function noBorrowThroughZero(a, len) {
  const A = digits(a, len)
  for (let ci = 0; ci < len - 1; ci++) if (A[ci] === 0) return false
  return true
}

function genSubBorrow(len) {
  const lo = 10 ** (len - 1), hi = 10 ** len - 1
  let a, b, guard = 0
  do {
    a = rint(lo + 1, hi); b = rint(lo, a - 1)
    guard++
  } while ((!needsBorrow(a, b) || !noBorrowThroughZero(a, len)) && guard < 400)
  return [a, b]
}

function needsBorrow(a, b) {
  const len = Math.max(String(a).length, String(b).length)
  const A = digits(a, len), B = digits(b, len)
  let borrow = 0
  for (let ci = len - 1; ci >= 0; ci--) {
    const top = A[ci] - borrow
    if (top < B[ci]) { borrow = 1; return true }
    borrow = 0
  }
  return false
}

// ---- public API ------------------------------------------------------------

// spec: { len, kind: 'add-nocarry'|'add-carry'|'sub-noborrow'|'sub-borrow'|'mix' }
export function buildProblem(spec) {
  let kind = spec.kind
  if (kind === 'mix') {
    kind = Math.random() < 0.5 ? 'add-carry' : 'sub-borrow'
  }
  let a, b, op
  switch (kind) {
    case 'add-nocarry': [a, b] = genAddNoCarry(spec.len); op = '+'; break
    case 'add-carry':   [a, b] = genAddCarry(spec.len);   op = '+'; break
    case 'sub-noborrow':[a, b] = genSubNoBorrow(spec.len); op = '-'; break
    case 'sub-borrow':  [a, b] = genSubBorrow(spec.len);  op = '-'; break
    default:            [a, b] = genAddCarry(spec.len);   op = '+'
  }
  const built = op === '+' ? addSteps(a, b) : subSteps(a, b)
  const answer = op === '+' ? a + b : a - b
  return { a, b, op, answer, ...built }
}
