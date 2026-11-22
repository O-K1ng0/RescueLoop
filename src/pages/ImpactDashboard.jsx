import { useState } from 'react'
import UrgencyAlerts from '../components/UrgencyAlerts.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import { impactTotals, fmtNum, KG_PER_PORTION, CO2E_PER_KG } from '../lib/impact.js'
import { downloadRescuesCsv } from '../lib/export.js'
import { downloadCsrReportPdf } from '../lib/pdf.js'

function countBy(items, keyFn) {
  const map = {}
  for (const item of items) {
    const key = keyFn(item)
    map[key] = (map[key] || 0) + 1
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export default function ImpactDashboard({ data, onNavigate, onRoleChange, zoneFilter = 'All', onZoneSelect, onZoneClear }) {
  const [copyStatus, setCopyStatus] = useState('')
  const [inrPerPortion, setInrPerPortion] = useState(85)

  const totals = impactTotals(data.listings)
  const delivered = data.listings.filter((l) => l.status === 'Delivered')
  const dishCounts = countBy(data.listings, (l) => l.foodName)
  const catererCounts = countBy(delivered, (l) => l.caterer)
  const dishMax = Math.max(1, ...dishCounts.map((d) => d.count))
  const catererMax = Math.max(1, ...catererCounts.map((c) => c.count))
  const deliveredPortions = delivered.reduce((sum, l) => sum + (Number(l.portions) || 0), 0)
  const costEstimateText = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(deliveredPortions * inrPerPortion)
  const topDish = dishCounts[0]

  const cards = [
    { label: 'Estimated meals saved', value: fmtNum(totals.meals, 0) },
    { label: 'Estimated food waste avoided (kg)', value: fmtNum(totals.kg, 1) },
    { label: 'Estimated CO2e avoided (kg)', value: fmtNum(totals.co2e, 1) }
  ]

  async function copySummary() {
    const today = new Date().toLocaleDateString('en-IN')
    const text = [
      `RescueLoop CSR summary (${today})`,
      `Delivered rescues: ${totals.count}`,
      `Estimated meals saved: ${fmtNum(totals.meals, 0)}`,
      `Estimated food waste avoided: ${fmtNum(totals.kg, 1)} kg`,
      `Estimated CO2e avoided: ${fmtNum(totals.co2e, 1)} kg CO2e`,
      'Estimates, not audited impact.'
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('Summary copied')
    } catch {
      setCopyStatus('Copy failed. Select the text manually.')
    }
    setTimeout(() => setCopyStatus(''), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <UrgencyAlerts data={data} onNavigate={onNavigate} onRoleChange={onRoleChange} />
      </div>

      <section aria-label="Live pipeline" className="grid grid-cols-2 gap-2 rounded-xl border border-green-100 bg-white p-3 shadow-sm md:grid-cols-4">
        {['Posted', 'Claimed', 'Collected', 'Delivered'].map((s) => (
          <div key={s} className="rounded-lg border border-emerald-100 bg-green-50 px-3 py-2 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-xs font-medium text-green-900/70">{s}</p>
            <p className="text-lg font-bold text-green-800">{data.listings.filter((l) => l.status === s).length}</p>
          </div>
        ))}
      </section>


      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-green-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-xs font-medium text-green-900/70">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{c.value}</p>
            <p className="mt-1 text-xs text-amber-700">Estimate</p>
          </div>
        ))}
      </section>

      <div className="print:hidden">
        <ZoneMap data={data} selectedZone={zoneFilter} onSelectZone={onZoneSelect} onClearZone={onZoneClear} />
      </div>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-green-800">How these estimates are calculated</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-green-900">
          <li>1 portion = 1 meal</li>
          <li>0.35 kg of food per portion ({KG_PER_PORTION} kg)</li>
          <li>2.5 kg CO2e avoided per kg of food saved ({CO2E_PER_KG} kg CO2e/kg)</li>
          <li>Figures count only Delivered listings.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-green-800">Caterer &amp; CSR Insights</h2>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-green-900">Most-posted dishes</h3>
          <p className="text-xs text-green-900/70">These show where caterers may be overcooking.</p>
          <ul className="mt-2 divide-y divide-green-100 text-sm">
            {dishCounts.map((d) => (
              <li key={d.name} className="py-2">
                <div className="flex justify-between">
                  <span>{d.name}</span>
                  <span className="font-bold">{d.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-green-100">
                  <div className="h-2 rounded-full bg-green-600 transition-all duration-500" style={{ width: `${(d.count / dishMax) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-green-900">Rescues by caterer</h3>
          <ul className="mt-2 divide-y divide-green-100 text-sm">
            {catererCounts.map((c) => (
              <li key={c.name} className="py-2">
                <div className="flex justify-between">
                  <span>{c.name}</span>
                  <span className="font-bold">{c.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-amber-100">
                  <div className="h-2 rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${(c.count / catererMax) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-green-900">Kitchen Overcooking Cost Estimate</h3>
          <p className="text-xs text-green-900/70">Rough internal estimate of food value in Delivered rescues. Not financial or tax advice.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-sm text-green-900">
              INR per portion
              <input
                type="number"
                min="0"
                value={inrPerPortion}
                onChange={(e) => setInrPerPortion(Math.max(0, Number(e.target.value) || 0))}
                className="ml-2 w-24 rounded-md border border-green-200 px-2 py-1 text-sm"
              />
            </label>
            {[60, 85, 120].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setInrPerPortion(r)}
                className={`rounded-md border px-3 py-1 text-xs font-medium ${inrPerPortion === r ? 'border-green-700 bg-green-700 text-white' : 'border-green-200 bg-white text-green-800 hover:bg-green-50'}`}
              >
                ₹{r}
              </button>
            ))}
          </div>
          <p className="mt-3 text-2xl font-bold text-green-700">{costEstimateText}</p>
          <p className="text-xs text-green-900/70">{deliveredPortions} delivered portions × ₹{inrPerPortion} per portion</p>
          {topDish && (
            <p className="mt-2 text-sm text-green-900">
              Top repeated dish: <span className="rounded bg-amber-200 px-2 py-0.5 font-semibold">{topDish.name}</span> ({topDish.count} {topDish.count === 1 ? 'listing' : 'listings'})
            </p>
          )}
          <p className="mt-2 text-xs text-amber-700">Internal rough estimate only, not financial or tax advice.</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copySummary}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98] hover:bg-green-800 print:hidden"
          >
            Copy CSR summary
          </button>
          <button
            type="button"
            onClick={() => downloadRescuesCsv(data.listings, data.ngos, data.volunteers)}
            className="rounded-lg border border-green-700 bg-white px-4 py-2 text-sm font-medium text-green-800 transition active:scale-[0.98] hover:bg-green-50 print:hidden"
          >
            Download CSV log
          </button>
          <button
            type="button"
            onClick={() => downloadCsrReportPdf({ listings: data.listings, ngos: data.ngos, volunteers: data.volunteers, inrPerPortion })}
            className="rounded-lg border border-green-700 bg-white px-4 py-2 text-sm font-medium text-green-800 transition active:scale-[0.98] hover:bg-green-50 print:hidden"
          >
            Download PDF report
          </button>
          {copyStatus && <span className="text-sm text-amber-800">{copyStatus}</span>}
        </div>

        <p className="mt-4 text-xs text-green-900/70">
          These are estimates, not audited impact. RescueLoop does not promise tax or legal benefits.
        </p>
      </section>

      <section className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-green-800">Receiver NGOs and community kitchens</h2>
        <ul className="mt-3 divide-y divide-green-100">
          {data.ngos.map((n) => (
            <li key={n.id} className="py-3 text-sm">
              <p className="font-medium text-green-900">{n.name}</p>
              <p className="text-green-900/70">{n.zone} · capacity {n.mealCapacity} meals · prefers {n.preferences.join(', ')}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
