import { useMemo } from 'react'
import { useNow } from '../lib/time.js'

const LEVEL = {
  overdue: { label: 'Overdue', cls: 'bg-red-600 text-white' },
  unassigned: { label: 'No volunteer', cls: 'bg-amber-500 text-white' },
  expiring: { label: 'Expiring soon', cls: 'bg-amber-200 text-amber-900' }
}
const ORDER = { overdue: 0, unassigned: 1, expiring: 2 }

// One alert per listing at most: overdue > no volunteer > expiring under 60 min.
// Overdue applies only to Posted or Claimed listings whose pickup window has passed.
export function classifyAlerts(listings, now) {
  const out = []
  for (const l of listings) {
    if (l.status !== 'Posted' && l.status !== 'Claimed') continue
    const mins = (l.pickupAt - now) / 60000
    if (mins < 0) {
      out.push({
        id: l.id, level: 'overdue',
        text: `${l.foodName} (${l.zone}) passed its pickup window ${Math.ceil(-mins)} min ago and is still ${l.status}.`,
        label: l.status === 'Posted' ? 'Open Find Food' : 'Open My Pickups',
        tab: l.status === 'Posted' ? 'Find Food' : 'My Pickups'
      })
    } else if (l.status === 'Claimed' && !l.volunteerId) {
      out.push({
        id: l.id, level: 'unassigned',
        text: `${l.foodName} (${l.zone}) is claimed but has no volunteer.`,
        label: 'Assign volunteer', tab: 'My Pickups'
      })
    } else if (mins < 60) {
      out.push({
        id: l.id, level: 'expiring',
        text: `${l.foodName} (${l.zone}) expires in ${Math.max(1, Math.floor(mins))} min and is still ${l.status}.`,
        label: l.status === 'Posted' ? 'Open Find Food' : 'Open My Pickups',
        tab: l.status === 'Posted' ? 'Find Food' : 'My Pickups'
      })
    }
  }
  return out.sort((a, b) => ORDER[a.level] - ORDER[b.level])
}

export default function UrgencyAlerts({ data, onNavigate, onRoleChange }) {
  const now = useNow()
  const alerts = useMemo(() => classifyAlerts(data.listings, now), [data.listings, now])
  const handleAction = (a) => {
    if (a.label === 'Assign volunteer' || a.label === 'Open My Pickups') onRoleChange?.('Volunteer')
    if (a.label === 'Open Find Food') onRoleChange?.('Receiver')
    onNavigate(a.tab)
  }

  if (alerts.length === 0) {
    return <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">No urgent pickups right now.</div>
  }
  return (
    <section aria-label="Urgency alerts" className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <h2 className="text-sm font-semibold text-amber-900">Urgency alerts ({alerts.length})</h2>
      <ul className="mt-2 space-y-2">
        {alerts.map((a) => (
          <li key={`${a.level}-${a.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL[a.level].cls}`}>{LEVEL[a.level].label}</span>
              <span className="text-green-950">{a.text}</span>
            </div>
            <button type="button" onClick={() => handleAction(a)} className="rounded-lg border border-green-300 bg-white px-3 py-1 text-xs font-semibold text-green-800 hover:bg-green-50">
              {a.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
