export const KG_PER_PORTION = 0.35
export const CO2E_PER_KG = 2.5

// Estimates only. 1 portion = 1 meal; 0.35 kg food per portion; 2.5 kg CO2e per kg food saved.
export function impactTotals(listings) {
  const delivered = listings.filter((l) => l.status === 'Delivered')
  const meals = delivered.reduce((sum, l) => sum + l.portions, 0)
  const kg = meals * KG_PER_PORTION
  return { count: delivered.length, meals, kg, co2e: kg * CO2E_PER_KG }
}

export function fmtNum(n, digits = 0) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
