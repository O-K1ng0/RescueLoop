import { useEffect, useState } from 'react'
import { ZONES } from '../data/seed.js'

// Fixed west-to-east layout (viewBox 800x420).
const POS = {
  Gachibowli: { x: 110, y: 200 },
  Kondapur: { x: 270, y: 310 },
  Madhapur: { x: 330, y: 150 },
  'Jubilee Hills': { x: 520, y: 220 },
  'Banjara Hills': { x: 680, y: 310 }
}
const ROADS = [
  ['Gachibowli', 'Madhapur'],
  ['Gachibowli', 'Kondapur'],
  ['Kondapur', 'Madhapur'],
  ['Madhapur', 'Jubilee Hills'],
  ['Jubilee Hills', 'Banjara Hills']
]
const R = 62

export default function ZoneMap({ data, selectedZone = 'All', onSelectZone, onClearZone }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  const stats = Object.fromEntries(
    ZONES.map((zone) => {
      const listings = data.listings.filter((l) => l.zone === zone)
      const active = listings.filter((l) => l.status !== 'Delivered').length
      const urgent = listings.some((l) => l.status === 'Posted' && (l.pickupAt - now) / 60000 < 60)
      const ngos = data.ngos.filter((n) => n.zone === zone).length
      const volunteers = data.volunteers.filter((v) => v.zone === zone).length
      return [zone, { active, ngos, volunteers, urgent }]
    })
  )

  return (
    <div className="rounded-xl border border-green-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-green-900">Hyderabad zones at a glance</h3>
        {selectedZone !== 'All' && (
          <button
            type="button"
            onClick={() => onClearZone?.()}
            className="rounded-lg border border-green-200 bg-white px-3 py-1 text-xs font-medium text-green-900 hover:bg-green-50"
          >
            Clear zone
          </button>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-lg bg-slate-50">
        <svg viewBox="0 0 800 420" role="img" aria-label="Map of Hyderabad zones" className="h-auto w-full">
          <g stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" fill="none">
            {ROADS.map(([a, b]) => (
              <line key={`${a}-${b}`} x1={POS[a].x} y1={POS[a].y} x2={POS[b].x} y2={POS[b].y} />
            ))}
          </g>

          {ZONES.map((zone) => {
            const p = POS[zone]
            if (!p) return null
            const s = stats[zone]
            const isSelected = selectedZone === zone
            const stroke = isSelected ? '#15803d' : s.urgent ? '#dc2626' : '#94a3b8'
            const strokeWidth = isSelected ? 6 : s.urgent ? 4 : 2
            const select = () => onSelectZone?.(zone)
            return (
              <g
                key={zone}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${zone}: ${s.active} active listings, ${s.ngos} receiver NGOs, ${s.volunteers} volunteers${s.urgent ? ', urgent pickups' : ''}`}
                onClick={select}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    select()
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                {s.urgent && <circle cx={p.x} cy={p.y} r={R + 10} fill="#fde68a" opacity="0.7" className="animate-urgent-pulse" />}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={R}
                  fill="#ffffff"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  className="transition-transform duration-200 hover:scale-[1.04] [transform-box:fill-box] origin-center"
                />
                <text x={p.x} y={p.y - 24} textAnchor="middle" fontSize="14" fontWeight="600" fill="#14532d">{zone}</text>
                <text x={p.x} y={p.y - 4} textAnchor="middle" fontSize="12" fill="#334155">Listings {s.active}</text>
                <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="12" fill="#334155">NGOs {s.ngos}</text>
                <text x={p.x} y={p.y + 28} textAnchor="middle" fontSize="12" fill="#334155">Volunteers {s.volunteers}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-green-900/80">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-red-600 bg-amber-200" aria-hidden="true" />
          Urgent Posted listing (under 60 min)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-[6px] border-green-700 bg-white" aria-hidden="true" />
          Selected zone
        </span>
        <span className="text-green-900/60">Click a zone to filter Find Food.</span>
      </div>
    </div>
  )
}
