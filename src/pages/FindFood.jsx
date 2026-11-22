import { useEffect, useMemo, useState } from 'react'
import { ZONES } from '../data/seed.js'

const NEARBY = {
  Madhapur: ['Gachibowli', 'Kondapur', 'Jubilee Hills'],
  Gachibowli: ['Madhapur', 'Kondapur'],
  Kondapur: ['Madhapur', 'Gachibowli'],
  'Banjara Hills': ['Jubilee Hills'],
  'Jubilee Hills': ['Banjara Hills', 'Madhapur']
}
const STATUS_STYLES = {
  Posted: 'bg-amber-100 text-amber-800',
  Claimed: 'bg-green-100 text-green-800',
  Collected: 'bg-green-200 text-green-900',
  Delivered: 'bg-green-700 text-white'
}
const PREF_MATCH = {
  'Dal and rice': (l) => /dal|rice/i.test(l.foodName),
  Sweets: (l) => /sweet/i.test(l.foodName),
  Fruit: (l) => /fruit/i.test(l.foodName),
  'Hot meals': (l) => l.storageType === 'Hot Box',
  Vegetarian: (l) => l.diet === 'Veg'
}

function useNow() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])
  return now
}

function countdownText(mins) {
  if (mins < 0) return 'Pickup window passed'
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

// Four transparent factors, each 0-1, equally weighted (25% each).
function scoreMatch(l, ngo, mins) {
  const zone = l.zone === ngo.zone ? 1 : NEARBY[ngo.zone]?.includes(l.zone) ? 0.6 : 0.2
  const ratio = l.portions / ngo.mealCapacity
  const portion = ratio > 1 ? 1 / ratio : ratio < 0.25 ? 0.5 : 1
  const hardConflict =
    (l.diet === 'Non-Veg' && !ngo.preferences.includes('Non-veg accepted')) ||
    (ngo.preferences.includes('No nuts') && l.allergens.includes('Nuts'))
  const hits = ngo.preferences.filter((p) => PREF_MATCH[p]?.(l))
  const diet = hardConflict ? 0 : hits.length ? 1 : 0.7
  const timing = mins < 0 ? 0 : mins < 60 ? 1 : mins < 120 ? 0.8 : mins < 180 ? 0.6 : 0.4
  const factors = { zone, portion, diet, timing }
  const avg = (zone + portion + diet + timing) / 4
  return { total: hardConflict ? 0 : Math.round(avg * 100), factors, hardConflict }
}

function reasonFor(l, m, mins) {
  if (m.hardConflict) {
    return l.diet === 'Non-Veg' ? 'Not a fit: this NGO does not accept non-veg food.' : 'Not a fit: contains nuts, which this NGO avoids.'
  }
  const zone = m.factors.zone === 1 ? 'same zone' : m.factors.zone >= 0.6 ? 'nearby zone' : 'farther zone'
  const portion = m.factors.portion === 1 ? 'portions fit capacity' : m.factors.portion === 0.5 ? 'small batch for capacity' : 'more portions than capacity'
  const diet = m.factors.diet === 1 ? 'matches a stated preference' : 'no stated preference match'
  const timing = mins < 0 ? 'pickup window passed' : mins < 60 ? 'urgent pickup' : 'pickup time is comfortable'
  return [zone, portion, diet, timing].join(' · ')
}

function suggestVolunteer(zone, volunteers, listings) {
  const activeCount = (vid) => listings.filter((l) => l.volunteerId === vid && (l.status === 'Claimed' || l.status === 'Collected')).length
  const rank = (v) => (v.zone === zone ? 0 : NEARBY[zone]?.includes(v.zone) ? 1 : 2)
  const best = [...volunteers].sort((a, b) => rank(a) - rank(b) || activeCount(a.id) - activeCount(b.id))[0]
  return best ? { volunteer: best, rank: rank(best), active: activeCount(best.id) } : null
}
const RANK_TEXT = ['same zone', 'nearby zone', 'other zone']

export default function FindFood({ data, role, claimListing, onNavigate, onRoleChange, zoneFilter = 'All', onZoneChange }) {
  const [ngoId, setNgoId] = useState(data.ngos[0]?.id ?? '')
  const [dietFilter, setDietFilter] = useState('All')
  const [showClaimed, setShowClaimed] = useState(false)
  const [banner, setBanner] = useState(null)
  const now = useNow()
  const isReceiver = role === 'Receiver'
  const ngo = data.ngos.find((n) => n.id === ngoId)

  const rows = useMemo(() => {
    return data.listings
      .filter((l) => showClaimed || l.status === 'Posted')
      .filter((l) => zoneFilter === 'All' || l.zone === zoneFilter)
      .filter((l) => dietFilter === 'All' || l.diet === dietFilter)
      .sort((a, b) => a.pickupAt - b.pickupAt)
      .map((l) => {
        const mins = (l.pickupAt - now) / 60000
        const match = isReceiver && ngo ? scoreMatch(l, ngo, mins) : null
        return { l, mins, match }
      })
  }, [data.listings, zoneFilter, dietFilter, showClaimed, isReceiver, ngo, now])

  const bestIds = useMemo(
    () =>
      rows
        .filter((r) => r.l.status === 'Posted' && r.match && r.match.total >= 70)
        .sort((a, b) => b.match.total - a.match.total)
        .slice(0, 2)
        .map((r) => r.l.id),
    [rows]
  )

  const handleClaim = (l) => {
    if (!ngo || l.status !== 'Posted' || l.claimedBy || l.pickupAt - Date.now() < 0) return
    claimListing(l.id, ngo.id)
    setBanner({ foodName: l.foodName, ngoName: ngo.name, id: l.id, at: Date.now() })
  }

  const selectCls = 'mt-1 block rounded-md border border-green-200 bg-white px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500'

  return (
    <section className="space-y-4">
      {role !== 'Receiver' && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-900">
          <p>Viewing as {role}. Switch to Receiver to see Smart Match scores and claim listings.</p>
          <button type="button" onClick={() => onRoleChange?.('Receiver')} className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">Switch to Receiver</button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-green-800">Find food</h2>
        {isReceiver && (
          <label className="text-sm text-green-900">
            Matching for{' '}
            <select value={ngoId} onChange={(e) => setNgoId(e.target.value)} className="rounded-md border border-green-200 bg-white px-2 py-1">
              {data.ngos.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </label>
        )}
      </div>

      {banner && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-300 bg-green-50 p-4">
          <p className="text-sm text-green-900">
            <span className="font-semibold text-green-800">Claimed at {new Date(banner.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</span>{' '}
            {banner.foodName} is now held for {banner.ngoName}.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setBanner(null); onNavigate('My Pickups') }} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">Open My Pickups</button>
            <button type="button" onClick={() => setBanner(null)} className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 hover:bg-green-50">Dismiss</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-green-100 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-green-900">
          Zone
          <select value={zoneFilter} onChange={(e) => onZoneChange?.(e.target.value)} className={selectCls}>
            <option value="All">All zones</option>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-green-900">
          Veg / Non-Veg
          <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value)} className={selectCls}>
            <option value="All">All</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-2 pb-1.5 text-sm text-green-900">
          <input type="checkbox" checked={showClaimed} onChange={(e) => setShowClaimed(e.target.checked)} className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-amber-500" />
          Show already claimed
        </label>
      </div>

      {rows.length === 0 && <p className="text-sm text-green-900/70">No listings match these filters.</p>}

      <ul className="grid gap-4 md:grid-cols-2">
        {rows.map(({ l, mins, match }) => {
          const open = l.status === 'Posted'
          const volunteer = suggestVolunteer(l.zone, data.volunteers, data.listings)
          const tags = l.allergens.filter((a) => a !== 'None')
          let claimBtn = null
          if (isReceiver) {
            if (l.status !== 'Posted' || l.claimedBy) {
              claimBtn = <button type="button" disabled className="mt-4 cursor-not-allowed rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">Already claimed</button>
            } else if (mins < 0) {
              claimBtn = <button type="button" disabled className="mt-4 cursor-not-allowed rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">Pickup window passed</button>
            } else if (ngo) {
              claimBtn = <button type="button" onClick={() => handleClaim(l)} className="mt-4 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">Claim for {ngo.name}</button>
            }
          }
          return (
            <li key={l.id} className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[l.status] ?? ''}`}>{l.status}</span>
                {open && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${countdownStyle(mins)}`}>{countdownText(mins)}</span>}
                {bestIds.includes(l.id) && <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">Best Match</span>}
                {match && <span className="rounded-full border border-green-300 px-2 py-0.5 text-xs font-semibold text-green-800">{match.total}% match</span>}
              </div>
              <h3 className="mt-2 font-semibold text-green-900">{l.foodName}</h3>
              <p className="text-sm text-green-900/70">{l.zone} · {l.caterer} · {l.portions} portions · {l.diet} · pickup by {l.pickupBy}</p>
              {l.claimedAt && <p className="text-xs text-green-900/60">Claimed at {new Date(l.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
              <p className="mt-2 text-sm text-green-950/80"><span className="font-medium">Storage: {l.storageType}.</span> {l.storage}</p>
              <p className="mt-1 text-sm text-green-950/80"><span className="font-medium">Handling:</span> {l.handlingNotes || 'No handling notes.'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-green-900/70">Allergens:</span>
                {tags.length === 0 && <span className="rounded-full bg-green-50 px-2 py-0.5 text-green-800">None declared</span>}
                {tags.map((a) => <span key={a} className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-medium text-red-800">{a}</span>)}
              </div>
              {match && (
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm">
                  <p className="text-green-900"><span className="font-semibold">{match.total}% for {ngo.name}:</span> {reasonFor(l, match, mins)}</p>
                  <p className="mt-1 text-xs text-green-900/70">
                    Zone {Math.round(match.factors.zone * 100)} · Portions {Math.round(match.factors.portion * 100)} · Diet {Math.round(match.factors.diet * 100)} · Timing {Math.round(match.factors.timing * 100)} (25% each)
                  </p>
                </div>
              )}
              {volunteer && (
                <p className="mt-2 text-xs text-green-900/80">
                  Suggested volunteer: <span className="font-medium">{volunteer.volunteer.name}</span> ({volunteer.volunteer.zone}, {RANK_TEXT[volunteer.rank]}, {volunteer.active} active pickups)
                </p>
              )}
              {claimBtn}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
