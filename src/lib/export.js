import { KG_PER_PORTION, CO2E_PER_KG } from './impact'

const HEADERS = [
  'ID', 'Food', 'Diet', 'Portions', 'Est Kg Saved', 'Est CO2e Kg', 'Caterer', 'Receiver NGO',
  'Volunteer', 'Zone', 'Handover Code', 'Posted', 'Claimed', 'Collected', 'Delivered'
]

// Quote every field, double embedded quotes, and neutralise spreadsheet formula injection.
function csvCell(value) {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function isoOrEmpty(ts) {
  return ts ? new Date(ts).toISOString() : ''
}

function buildRescuesCsv(listings, ngos, volunteers) {
  const ngoName = Object.fromEntries((ngos || []).map((n) => [n.id, n.name]))
  const volunteerName = Object.fromEntries((volunteers || []).map((v) => [v.id, v.name]))
  const delivered = (listings || []).filter((l) => l.status === 'Delivered')

  const rows = delivered.map((l) => {
    const kg = l.portions * KG_PER_PORTION
    return [
      l.id,
      l.foodName,
      l.diet,
      l.portions,
      kg.toFixed(2),
      (kg * CO2E_PER_KG).toFixed(2),
      l.caterer,
      ngoName[l.claimedBy] || '',
      volunteerName[l.volunteerId] || '',
      l.zone,
      l.handoverCode || '',
      isoOrEmpty(l.createdAt),
      isoOrEmpty(l.claimedAt),
      isoOrEmpty(l.collectedAt),
      isoOrEmpty(l.deliveredAt)
    ]
  })

  return [HEADERS, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

export function downloadRescuesCsv(listings, ngos, volunteers) {
  const csv = buildRescuesCsv(listings, ngos, volunteers)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rescueloop-impact-log.csv'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
