import { jsPDF } from 'jspdf'
import { KG_PER_PORTION, CO2E_PER_KG, fmtNum } from './impact'

// A4 portrait, helvetica only (standard PDF font: no glyph issues). Currency is written as "INR", never the rupee symbol.
const PAGE_W = 210
const MARGIN = 14
const CONTENT_W = PAGE_W - MARGIN * 2
const GREEN = [22, 101, 52]
const LIGHT = [240, 247, 242]
const BORDER = [203, 213, 225]
const DARK = [31, 41, 55]
const MUTED = [100, 116, 139]
const WHITE = [255, 255, 255]
const DISCLAIMER =
  'Estimates only, not audited impact; RescueLoop does not certify food safety or promise tax/legal benefits.'
const MAX_TABLE_ROWS = 18

function pad2(n) {
  return String(n).padStart(2, '0')
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function fmtDateTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Delivered Time for the CSR table: "22 Nov, 05:44 pm" (no year), assembled from local getters.
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtDeliveredTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const h = d.getHours()
  const h12 = h % 12 || 12
  return `${pad2(d.getDate())} ${SHORT_MONTHS[d.getMonth()]}, ${pad2(h12)}:${pad2(d.getMinutes())} ${h >= 12 ? 'pm' : 'am'}`
}

function fmtInr(amount) {
  return `INR ${Math.round(amount).toLocaleString('en-IN')}`
}

// Same slug rule as the filename spec: non-alphanumeric runs become "-", dashes trimmed.
function slug(text) {
  return String(text ?? '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Truncate text with "..." so it fits within maxW mm at the current font settings.
function fit(doc, text, maxW) {
  const s = text == null ? '' : String(text)
  if (doc.getTextWidth(s) <= maxW) return s
  let t = s
  while (t.length > 0 && doc.getTextWidth(t + '...') > maxW) t = t.slice(0, -1)
  return t + '...'
}

function setColor(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2])
}

function drawBanner(doc, title, subtitle) {
  doc.setFillColor(...GREEN)
  doc.rect(0, 0, PAGE_W, 30, 'F')
  setColor(doc, WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(title, MARGIN, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(subtitle, MARGIN, 23)
}

function drawFooter(doc) {
  doc.setDrawColor(...BORDER)
  doc.line(MARGIN, 276, PAGE_W - MARGIN, 276)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  setColor(doc, MUTED)
  const lines = doc.splitTextToSize(DISCLAIMER, CONTENT_W)
  doc.text(lines, MARGIN, 281)
}

function buildNameMaps(ngos, volunteers) {
  return {
    ngoName: Object.fromEntries((ngos || []).map((n) => [n.id, n.name])),
    volunteerName: Object.fromEntries((volunteers || []).map((v) => [v.id, v.name]))
  }
}

// CSR impact report: KPI cards, caterer waste summary, capped table of Delivered rescues, one page.
export function downloadCsrReportPdf({ listings, ngos, volunteers, inrPerPortion }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const { ngoName, volunteerName } = buildNameMaps(ngos, volunteers)
  const delivered = (listings || []).filter((l) => l.status === 'Delivered')

  const meals = delivered.reduce((sum, l) => sum + (Number(l.portions) || 0), 0)
  const kg = meals * KG_PER_PORTION
  const co2e = kg * CO2E_PER_KG
  const rate = Number(inrPerPortion) || 0

  // Same basis as ImpactDashboard "Most-posted dishes": all listings, grouped by foodName.
  // Ties go to the dish seen first, matching the dashboard's stable sort.
  const dishCounts = {}
  ;(listings || []).forEach((l) => {
    const dish = l.foodName || 'Unnamed'
    dishCounts[dish] = (dishCounts[dish] || 0) + 1
  })
  let topDish = 'None'
  let topCount = 0
  Object.entries(dishCounts).forEach(([dish, count]) => {
    if (count > topCount) {
      topDish = dish
      topCount = count
    }
  })

  drawBanner(
    doc,
    'RescueLoop - Hyderabad Food Rescue CSR Impact Report',
    `Generated ${todayIso()}`
  )

  // KPI cards
  const kpis = [
    { label: 'Estimated Meals Saved', value: fmtNum(meals) },
    { label: 'Food Waste Avoided (kg)', value: fmtNum(kg, 1) },
    { label: 'CO2e Avoided (kg)', value: fmtNum(co2e, 1) }
  ]
  const cardGap = 5
  const cardW = (CONTENT_W - cardGap * 2) / 3
  kpis.forEach((k, i) => {
    const x = MARGIN + i * (cardW + cardGap)
    doc.setFillColor(...LIGHT)
    doc.setDrawColor(...GREEN)
    doc.setLineWidth(0.4)
    doc.roundedRect(x, 38, cardW, 28, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setColor(doc, MUTED)
    doc.text(k.label, x + cardW / 2, 46, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    setColor(doc, GREEN)
    doc.text(k.value, x + cardW / 2, 58, { align: 'center' })
  })

  // Caterer & kitchen waste summary box
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, 74, CONTENT_W, 40, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setColor(doc, DARK)
  doc.text('Caterer & Kitchen Waste Summary', MARGIN + 4, 82)

  const summaryRows = [
    ['Total food value (est.)', rate > 0 ? fmtInr(meals * rate) : 'Not set'],
    [
      'Top repeated dish',
      topCount > 0
        ? `${fit(doc, topDish, 110)} (${topCount} ${topCount === 1 ? 'listing' : 'listings'})`
        : topDish
    ],
    ['Delivered rescues', fmtNum(delivered.length)]
  ]
  summaryRows.forEach(([label, value], i) => {
    const y = 91 + i * 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setColor(doc, MUTED)
    doc.text(label, MARGIN + 4, y)
    doc.setFont('helvetica', 'bold')
    setColor(doc, DARK)
    doc.text(value, MARGIN + 60, y)
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setColor(doc, MUTED)
  doc.text(
    'Rough internal estimate: food value = portions x INR per portion. Not an audited figure.',
    MARGIN + 4,
    109
  )

  // Delivered rescues table, drawn manually
  // Widths sum to CONTENT_W (182 mm). Delivered Time is never truncated (noClip).
  const cols = [
    { key: 'Food', w: 36 },
    { key: 'Portions', w: 13 },
    { key: 'Caterer', w: 32 },
    { key: 'Receiver NGO', w: 37 },
    { key: 'Zone', w: 20 },
    { key: 'Code', w: 14 },
    { key: 'Delivered Time', w: 30, noClip: true }
  ]
  const tableTop = 122
  const rowH = 7
  let x = MARGIN
  doc.setFillColor(...GREEN)
  doc.rect(MARGIN, tableTop, CONTENT_W, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setColor(doc, WHITE)
  cols.forEach((c) => {
    doc.text(fit(doc, c.key, c.w - 3), x + 1.5, tableTop + 5.3)
    x += c.w
  })

  const shown = delivered.slice(0, MAX_TABLE_ROWS)
  shown.forEach((l, r) => {
    const y = tableTop + 8 + r * rowH
    if (r % 2 === 1) {
      doc.setFillColor(...LIGHT)
      doc.rect(MARGIN, y, CONTENT_W, rowH, 'F')
    }
    const cells = [
      l.foodName || '',
      String(l.portions ?? ''),
      l.caterer || '',
      ngoName[l.claimedBy] || '',
      l.zone || '',
      l.handoverCode || '',
      fmtDeliveredTime(l.deliveredAt)
    ]
    let cx = MARGIN
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setColor(doc, DARK)
    cells.forEach((text, i) => {
      const cellText = cols[i].noClip ? String(text) : fit(doc, text, cols[i].w - 3)
      doc.text(cellText, cx + 1.5, y + 4.6)
      cx += cols[i].w
    })
  })

  const tableEnd = tableTop + 8 + shown.length * rowH
  if (shown.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    setColor(doc, MUTED)
    doc.text('No delivered rescues yet.', MARGIN + 2, tableEnd + 6)
  }
  const hidden = delivered.length - shown.length
  if (hidden > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setColor(doc, MUTED)
    doc.text(`+ ${fmtNum(hidden)} more rows in CSV log`, MARGIN, tableEnd + 6)
  }

  drawFooter(doc)
  doc.save(`RescueLoop-CSR-Impact-Report-${todayIso()}.pdf`)
}

// Single-donation handover summary: ID + code badge, details, four-step timeline, one page.
export function downloadDonationReceiptPdf({ listing, ngos, volunteers }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const { ngoName, volunteerName } = buildNameMaps(ngos, volunteers)
  const l = listing
  const kg = (Number(l.portions) || 0) * KG_PER_PORTION
  const co2e = kg * CO2E_PER_KG

  drawBanner(doc, 'RescueLoop - Donation Handover Summary', `Generated ${todayIso()}`)

  // Rescue ID and handover code badge
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  setColor(doc, DARK)
  doc.text(`Rescue ID: ${l.id}`, MARGIN, 45)

  const badgeX = PAGE_W - MARGIN - 52
  doc.setFillColor(...LIGHT)
  doc.setDrawColor(...GREEN)
  doc.setLineWidth(0.4)
  doc.roundedRect(badgeX, 36, 52, 24, 2, 2, 'FD')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setColor(doc, MUTED)
  doc.text('Handover Code', badgeX + 26, 42, { align: 'center' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  setColor(doc, GREEN)
  doc.text(String(l.handoverCode || '----'), badgeX + 26, 54, { align: 'center' })

  // Detail rows
  const details = [
    ['Donor / Caterer', l.caterer || '-'],
    ['Receiver NGO', ngoName[l.claimedBy] || 'Not yet claimed'],
    ['Assigned Volunteer', volunteerName[l.volunteerId] || 'Not yet assigned'],
    ['Zone', l.zone || '-'],
    ['Food', l.foodName || '-'],
    ['Portions', String(l.portions ?? '-')],
    [
      'Estimated Impact',
      `${fmtNum(l.portions || 0)} meals, ${fmtNum(kg, 2)} kg food, ${fmtNum(co2e, 2)} kg CO2e`
    ]
  ]
  if (l.storage) details.push(['Storage', String(l.storage)])
  if (l.allergens) {
    details.push([
      'Allergens',
      Array.isArray(l.allergens) ? l.allergens.join(', ') : String(l.allergens)
    ])
  }

  details.forEach(([label, value], i) => {
    const y = 72 + i * 9
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    setColor(doc, MUTED)
    doc.text(label, MARGIN, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    setColor(doc, DARK)
    doc.text(fit(doc, value, CONTENT_W - 52), MARGIN + 46, y)
  })

  // Four-step handover timeline
  const tlTop = 72 + details.length * 9 + 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setColor(doc, DARK)
  doc.text('Handover Timeline', MARGIN, tlTop)

  const steps = [
    { name: 'Posted', ts: l.createdAt },
    { name: 'Claimed', ts: l.claimedAt },
    { name: 'Collected', ts: l.collectedAt },
    { name: 'Delivered', ts: l.deliveredAt }
  ]
  const lineY = tlTop + 16
  const firstX = MARGIN + 15
  const lastX = PAGE_W - MARGIN - 15
  const stepGap = (lastX - firstX) / (steps.length - 1)
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.6)
  doc.line(firstX, lineY, lastX, lineY)

  steps.forEach((s, i) => {
    const cx = firstX + i * stepGap
    const done = Boolean(s.ts)
    if (done) {
      doc.setFillColor(...GREEN)
      doc.circle(cx, lineY, 3.5, 'F')
    } else {
      doc.setFillColor(...WHITE)
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.5)
      doc.circle(cx, lineY, 3.5, 'FD')
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    setColor(doc, DARK)
    doc.text(s.name, cx, lineY + 9, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setColor(doc, done ? DARK : MUTED)
    doc.text(done ? fmtDateTime(s.ts) : 'Pending', cx, lineY + 14, { align: 'center' })
  })

  drawFooter(doc)
  const filename = `RescueLoop-Donation-${slug(l.foodName)}-${slug(l.zone)}-${l.id}.pdf`
  doc.save(filename)
}
