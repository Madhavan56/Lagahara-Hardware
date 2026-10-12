/**
 * Square-feet → sheets calculator for sheet goods (plywood, laminates).
 * Pure and framework-free so the storefront widget, the admin quote page and
 * the unit tests (tests/sheetCalculator.test.ts) all share one set of formulas:
 *
 *   areaSqFt       = lengthFt × widthFt
 *   withWastage    = areaSqFt × (1 + wastagePercent / 100)
 *   sheetAreaSqFt  = sheetLengthFt × sheetWidthFt
 *   sheetsRequired = ceil(withWastage / sheetAreaSqFt)
 *   estimatedPrice = sheetsRequired × pricePerSheet
 */

export type LengthUnit = 'ft' | 'in' | 'm' | 'mm'

export const LENGTH_UNITS: readonly { value: LengthUnit; label: string }[] = [
  { value: 'ft', label: 'Feet' },
  { value: 'in', label: 'Inches' },
  { value: 'm', label: 'Meters' },
  { value: 'mm', label: 'mm' },
]

const FEET_PER_UNIT: Record<LengthUnit, number> = {
  ft: 1,
  in: 1 / 12,
  m: 1 / 0.3048,
  mm: 1 / 304.8,
}

export const MAX_WASTAGE_PERCENT = 50

/** Absorbs float noise so an exact fit (e.g. 64 / 32) never rounds up to an extra sheet. */
const EPSILON = 1e-9

export type SheetCalcInput = {
  length: number
  width: number
  unit: LengthUnit
  wastagePercent: number
  sheetLengthFt: number
  sheetWidthFt: number
  pricePerSheet: number
}

export type SheetCalcResult = {
  areaSqFt: number
  areaWithWastageSqFt: number
  sheetAreaSqFt: number
  sheetsRequired: number
  estimatedPrice: number
}

export type SheetCalcOutcome =
  | { ok: true; result: SheetCalcResult }
  | { ok: false; error: string }

export function toFeet(value: number, unit: LengthUnit): number {
  return value * FEET_PER_UNIT[unit]
}

function isPositive(value: number) {
  return Number.isFinite(value) && value > 0
}

export function calculateSheets(input: SheetCalcInput): SheetCalcOutcome {
  if (!isPositive(input.length) || !isPositive(input.width)) {
    return { ok: false, error: 'Enter a length and width greater than zero.' }
  }
  if (
    !Number.isFinite(input.wastagePercent) ||
    input.wastagePercent < 0 ||
    input.wastagePercent > MAX_WASTAGE_PERCENT
  ) {
    return { ok: false, error: `Wastage must be between 0 and ${MAX_WASTAGE_PERCENT}%.` }
  }
  if (!isPositive(input.sheetLengthFt) || !isPositive(input.sheetWidthFt)) {
    return { ok: false, error: 'This product has no sheet size set.' }
  }
  if (!Number.isFinite(input.pricePerSheet) || input.pricePerSheet < 0) {
    return { ok: false, error: 'This product has no valid price.' }
  }

  const areaSqFt = toFeet(input.length, input.unit) * toFeet(input.width, input.unit)
  const areaWithWastageSqFt = areaSqFt * (1 + input.wastagePercent / 100)
  const sheetAreaSqFt = input.sheetLengthFt * input.sheetWidthFt
  const sheetsRequired = Math.max(1, Math.ceil(areaWithWastageSqFt / sheetAreaSqFt - EPSILON))

  return {
    ok: true,
    result: {
      areaSqFt,
      areaWithWastageSqFt,
      sheetAreaSqFt,
      sheetsRequired,
      estimatedPrice: Math.round(sheetsRequired * input.pricePerSheet * 100) / 100,
    },
  }
}

/** Parses catalog sheet sizes like "8x4 ft" / "8 × 4 ft" into feet. */
export function parseSheetSize(value: string | null | undefined): { lengthFt: number; widthFt: number } | null {
  const match = value?.match(/^\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft)?\s*$/i)
  if (!match) return null
  const lengthFt = Number(match[1])
  const widthFt = Number(match[2])
  return lengthFt > 0 && widthFt > 0 ? { lengthFt, widthFt } : null
}
