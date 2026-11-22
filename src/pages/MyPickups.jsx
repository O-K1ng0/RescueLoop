import { useState } from 'react'
import UrgencyAlerts from '../components/UrgencyAlerts.jsx'
import { useNow, fmtTime } from '../lib/time.js'
import { suggestVolunteerId } from '../lib/volunteers.js'

const STEPS = [
  { key: 'Posted', field: 'createdAt' },
  { key: 'Claimed', field: 'claimedAt' },
  { key: 'Collected', field: 'collectedAt' },
  { key: 'Delivered', field: 'deliveredAt' }
]

function countdown(mins) {
  if (mins < 0) return `Overdue by ${Math.ceil(-mins)} min`
  if (mins < 60) return `${Math.max(1, Math.floor(mins))} min left`
  const h = Math.floor(mins / 60)
  const m = Math.floor(mins % 60)
  return m ? `${h} hr ${m} min left` : `${h} hr left`
}
function countdownStyle(mins) {
  if (mins < 60) return 'bg-red-600 text-white'
  if (mins < 120) return 'bg-amber-500 text-white'
  return 'bg-green-100 text-green-800'
}

function ProgressSteps({ listing }) {
  let prevDone = true
  return (
    <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Pickup progress">
      {STEPS.map((s) => {
        const ts = listing[s.field]
        const done = Boolean(ts)
        const current = !done && prevDone
        prevDone = done
        return (
          <li key={s.key} className="min-w-0">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${done ? 'bg-green-600' : current ? 'bg-amber-400' : 'bg-green-100'}`} />
            <p className={`mt-1.5 truncate text-xs font-semibold ${done ? 'text-green-800' : current ? 'text-amber-700' : 'text-green-900/50'}`}>{s.key}</p>
            <p className="text-[11px] text-green-900/70">{ts ? fmtTime(ts) : current ? 'In progress' : 'Pending'}</p>
          </li>
        )
      })}
    </ol>
  )
}

const selectCls = 'mt-1 block w-full rounded-md border border-green-200 bg-white px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'
const btnCls = 'mt-4 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition active:scale-[0.98] hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'

export default function MyPickups({ data, role, assignVolunteer, markCollected, markDelivered, onNavigate, onRoleChange }) {
  const now = useNow()
  const [banner, setBanner] = useState(null)
  const [checks, setChecks] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const isVolunteer = role === 'Volunteer'
  const active = data.listings
    .filter((l) => l.status === 'Claimed' || l.status === 'Collected')
    .sort((a, b) => a.pickupAt - b.pickupAt)
  const nameOf = (id) => data.ngos.find((n) => n.id === id)?.name ?? 'Unassigned'
  const volName = (id) => data.volunteers.find((v) => v.id === id)?.name ?? 'Not yet assigned'

  const handleDeliver = (l) => {
    markDelivered(l.id)
    setBanner({ foodName: l.foodName, at: Date.now() })
  }

  const setCheck = (id, key, value) => setChecks((c) => ({ ...c, [id]: { ...c[id], [key]: value } }))

  const copyDispatch = async (l) => {
    const text = [
      `Dispatch: ${l.foodName}`,
      `Portions: ${l.portions}`,
      `Zone: ${l.zone}`,
      `Caterer: ${l.caterer}`,
      `Receiver NGO: ${nameOf(l.claimedBy)}`,
      `Pickup by: ${l.pickupBy}`,
      `Storage: ${l.storageType}. ${l.storage}`,
      `Allergens: ${l.allergens.filter((a) => a !== 'None').join(', ') || 'None declared'}`,
      `Handover code: ${l.handoverCode ?? 'N/A'}`
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopiedId(l.id)
    setTimeout(() => setCopiedId((cur) => (cur === l.id ? null : cur)), 2000)
  }

  return (
    <section className="space-y-4">
      {role !== 'Volunteer' && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-900">
          <p>Viewing as {role}. Switch to Volunteer to assign pickups and update delivery status.</p>
          <button type="button" onClick={() => onRoleChange?.('Volunteer')} className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">Switch to Volunteer</button>
        </div>
      )}
      <h2 className="text-lg font-semibold text-green-800">My pickups</h2>
      <UrgencyAlerts data={data} onNavigate={onNavigate} onRoleChange={onRoleChange} />

      {banner && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-300 bg-green-50 p-4">
          <p className="text-sm text-green-900">
            <span className="font-semibold text-green-800">Delivered at {fmtTime(banner.at)}.</span> {banner.foodName} has been handed over.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setBanner(null); onNavigate('History') }} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">View in History</button>
            <button type="button" onClick={() => { setBanner(null); onNavigate('Impact Dashboard') }} className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 hover:bg-green-50">View in Impact Dashboard</button>
            <button type="button" onClick={() => setBanner(null)} className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 hover:bg-green-50">Dismiss</button>
          </div>
        </div>
      )}

      {active.length === 0 && <p className="text-sm text-green-900/70">No active pickups.</p>}

      <ul className="grid gap-4 md:grid-cols-2">
        {active.map((l) => {
          const mins = (l.pickupAt - now) / 60000
          const suggestedVid = suggestVolunteerId(l.zone, data.volunteers, data.listings)
          const selectedVid = l.volunteerId ?? suggestedVid
          const tags = l.allergens.filter((a) => a !== 'None')
          return (
            <li key={l.id} className="rounded-xl border border-green-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${l.status === 'Claimed' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{l.status}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${countdownStyle(mins)}`}>{countdown(mins)}</span>
              </div>
              <h3 className="mt-2 font-semibold text-green-900">{l.foodName}</h3>
              <p className="text-sm text-green-900/70">{l.caterer} → {nameOf(l.claimedBy)}</p>
              <p className="text-sm text-green-900/70">{l.zone} · {l.portions} portions · {l.diet} · pickup by {l.pickupBy}</p>
              <p className="mt-2 text-sm font-semibold text-green-900">Handover code: <span className="font-mono text-base tracking-widest">{l.handoverCode ?? '—'}</span></p>

              <ProgressSteps listing={l} />

              <p className="mt-3 text-sm text-green-950/80"><span className="font-medium">Storage: {l.storageType}.</span> {l.storage}</p>
              <p className="mt-1 text-sm text-green-950/80"><span className="font-medium">Handling:</span> {l.handlingNotes || 'No handling notes.'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-green-900/70">Allergens:</span>
                {tags.length === 0 && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-800">None declared</span>}
                {tags.map((a) => <span key={a} className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-medium text-red-800">{a}</span>)}
              </div>

              {isVolunteer ? (
                <label className="mt-3 block text-sm font-medium text-green-900">
                  Volunteer
                  <select value={selectedVid ?? ''} onChange={(e) => assignVolunteer(l.id, e.target.value)} className={selectCls}>
                    <option value="">Choose a volunteer</option>
                    {data.volunteers.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.zone})</option>)}
                  </select>
                  {!l.volunteerId && selectedVid && <span className="mt-1 block text-xs font-normal text-amber-700">Suggested for this zone. Confirm by choosing or marking collected.</span>}
                </label>
              ) : (
                <p className="mt-3 text-sm text-green-900/80">Volunteer: <span className="font-medium">{volName(l.volunteerId)}</span></p>
              )}

              {isVolunteer && l.status === 'Claimed' && (
                <>
                  <div className="mt-3 space-y-1.5 text-sm text-green-900">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={Boolean(checks[l.id]?.sealed)} onChange={(e) => setCheck(l.id, 'sealed', e.target.checked)} className="h-4 w-4 accent-green-600" />
                      Containers sealed &amp; intact
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={Boolean(checks[l.id]?.storage)} onChange={(e) => setCheck(l.id, 'storage', e.target.checked)} className="h-4 w-4 accent-green-600" />
                      Storage matches listing (Hot Box / Chilled / Room Temp)
                    </label>
                    <p className="text-xs text-green-900/60">Basic handover check only, not a food safety certification.</p>
                  </div>
                  <button type="button" disabled={!selectedVid || !checks[l.id]?.sealed || !checks[l.id]?.storage} onClick={() => markCollected(l.id, selectedVid)} className={btnCls}>Mark Collected</button>
                </>
              )}
              {isVolunteer && l.status === 'Collected' && (
                <button type="button" onClick={() => handleDeliver(l)} className={btnCls}>Mark Delivered</button>
              )}
              <button type="button" onClick={() => copyDispatch(l)} className={`mt-3 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 transition active:scale-[0.98] hover:bg-green-50`}>{copiedId === l.id ? 'Copied!' : 'Copy WhatsApp dispatch'}</button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
