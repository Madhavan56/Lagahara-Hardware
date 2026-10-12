import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateSheets, parseSheetSize, toFeet, type SheetCalcInput } from '../src/lib/sheetCalculator'

const base: SheetCalcInput = {
  length: 10,
  width: 10,
  unit: 'ft',
  wastagePercent: 10,
  sheetLengthFt: 8,
  sheetWidthFt: 4,
  pricePerSheet: 2000,
}

function ok(input: SheetCalcInput) {
  const outcome = calculateSheets(input)
  assert.ok(outcome.ok, outcome.ok ? '' : outcome.error)
  return outcome.result
}

describe('toFeet', () => {
  it('converts every unit', () => {
    assert.equal(toFeet(12, 'in'), 1)
    assert.equal(toFeet(304.8, 'mm'), 1)
    assert.ok(Math.abs(toFeet(1, 'm') - 3.28084) < 1e-5)
    assert.equal(toFeet(5, 'ft'), 5)
  })
})

describe('calculateSheets', () => {
  it('10x10 ft with 10% wastage on 8x4 sheets', () => {
    const r = ok(base)
    assert.equal(r.areaSqFt, 100)
    assert.ok(Math.abs(r.areaWithWastageSqFt - 110) < 1e-9)
    assert.equal(r.sheetAreaSqFt, 32)
    assert.equal(r.sheetsRequired, 4) // 110 / 32 = 3.44 → 4
    assert.equal(r.estimatedPrice, 8000)
  })

  it('an exact fit does not round up to an extra sheet', () => {
    const r = ok({ ...base, length: 8, width: 8, wastagePercent: 0 })
    assert.equal(r.sheetsRequired, 2) // 64 / 32
  })

  it('float noise from unit conversion does not add a sheet', () => {
    // 2.4384 m = exactly 8 ft; 1.2192 m = 4 ft → exactly one 8x4 sheet.
    const r = ok({ ...base, length: 2.4384, width: 1.2192, unit: 'm', wastagePercent: 0 })
    assert.equal(r.sheetsRequired, 1)
  })

  it('handles inches and millimetres', () => {
    assert.equal(ok({ ...base, length: 120, width: 120, unit: 'in' }).areaSqFt, 100)
    const mm = ok({ ...base, length: 3048, width: 3048, unit: 'mm' })
    assert.ok(Math.abs(mm.areaSqFt - 100) < 1e-9)
  })

  it('always needs at least one sheet for a tiny area', () => {
    assert.equal(ok({ ...base, length: 1, width: 1, wastagePercent: 0 }).sheetsRequired, 1)
  })

  it('rejects invalid input', () => {
    assert.equal(calculateSheets({ ...base, length: 0 }).ok, false)
    assert.equal(calculateSheets({ ...base, width: -2 }).ok, false)
    assert.equal(calculateSheets({ ...base, length: Number.NaN }).ok, false)
    assert.equal(calculateSheets({ ...base, wastagePercent: -1 }).ok, false)
    assert.equal(calculateSheets({ ...base, wastagePercent: 51 }).ok, false)
    assert.equal(calculateSheets({ ...base, sheetLengthFt: 0 }).ok, false)
    assert.equal(calculateSheets({ ...base, pricePerSheet: -1 }).ok, false)
  })
})

describe('parseSheetSize', () => {
  it('parses catalog formats', () => {
    assert.deepEqual(parseSheetSize('8x4 ft'), { lengthFt: 8, widthFt: 4 })
    assert.deepEqual(parseSheetSize('10 × 4 ft'), { lengthFt: 10, widthFt: 4 })
    assert.deepEqual(parseSheetSize('8.5X4'), { lengthFt: 8.5, widthFt: 4 })
  })

  it('rejects anything else', () => {
    assert.equal(parseSheetSize(null), null)
    assert.equal(parseSheetSize('large'), null)
    assert.equal(parseSheetSize('0x4 ft'), null)
  })
})
