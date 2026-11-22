import { useState } from 'react'
import { ZONES } from '../data/seed.js'
import { KG_PER_PORTION, fmtNum } from '../lib/impact.js'
import { fmtTime } from '../lib/time.js'
import { downloadRescuesCsv } from '../lib/export.js'
import { downloadDonationReceiptPdf } from '../lib/pdf.js'

const toMs = (v) => new Date(v).getTime() || 0

export default function History({ data }) {
  const [zone, setZone] = useState('All')

  const done = data.listings
    .filter((l) => l.status === 'Delivered')
    .filter((l) => zone === 'All' || l.zone === zone)
    .sort((a, b) => toMs(b.deliveredAt) - toMs(a.deliveredAt))

  const ngoName = (id) => data.ngos.find((n) => n.id === id)?.name ?? 'Unknown'
  const volunteerName = (id) => data.volunteers.find((v) => v.id === id)?.name ?? 'Not recorded'
  const stamp = (ts) => (ts ? fmtTime(ts) : 'Not recorded')

  const steps = (l) => [
    ['Posted', l.createdAt],
    ['Claimed', l.claimedAt],
    ['Collected', l.collectedAt],
    ['Delivered', l.deliveredAt],
  ]

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-green-800">Completed rescues</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-green-900">
            <span className="font-medium">Zone</span>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="rounded-lg border border-green-200 bg-white px-2 py-1 text-sm"
            >
              <option value="All">All zones</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              downloadRescuesCsv(
                zone === 'All' ? data.listings : data.listings.filter((l) => l.zone === zone),
                data.ngos,
                data.volunteers
              )
            }
            className="print:hidden rounded-lg border border-green-200 bg-white px-3 py-1 text-sm font-medium text-green-800 hover:bg-green-50"
          >
            Download CSV
          </button>
        </div>
      </div>

      {done.length === 0 ? (
        <p className="text-sm text-green-900/70">No completed rescues in this zone.</p>
      ) : (
        <ul className="divide-y divide-green-100 rounded-xl border border-green-100 bg-white shadow-sm">
          {done.map((l) => (
            <li key={l.id} className="space-y-2 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-green-900">{l.foodName} · {l.portions} portions</p>
                  <p className="text-green-900/70">
                    Estimated {fmtNum(l.portions * KG_PER_PORTION, 2)} kg saved (estimate)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Delivered</span>
                  <button
                    type="button"
                    onClick={() => downloadDonationReceiptPdf({ listing: l, ngos: data.ngos, volunteers: data.volunteers })}
                    className="print:hidden rounded-lg border border-green-200 bg-white px-2 py-0.5 text-xs font-medium text-green-800 hover:bg-green-50"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
              <p className="text-green-900/70">
                Caterer: {l.caterer} · Receiver NGO: {ngoName(l.claimedBy)} · Volunteer: {volunteerName(l.volunteerId)} · Zone: {l.zone}
              </p>
              <ol className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-green-900/80">
                {steps(l).map(([label, ts]) => (
                  <li key={label}>
                    <span className="font-medium">{label}:</span> {stamp(ts)}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
