import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrPreciseFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(amount: number, precise = false) {
  return precise ? inrPreciseFormatter.format(amount) : inrFormatter.format(amount)
}

/** Prices are GST-inclusive, so the tax component is extracted, never added. */
export function extractGst(inclusiveAmount: number, gstRate: number) {
  const taxable = inclusiveAmount / (1 + gstRate / 100)
  return Math.round((inclusiveAmount - taxable) * 100) / 100
}

export function formatEta(minDays: number, maxDays: number) {
  if (minDays === maxDays) {
    return minDays === 1 ? 'Next day' : `${minDays} days`
  }
  return `${minDays}–${maxDays} days`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(typeof value === 'string' ? new Date(value) : value)
}
