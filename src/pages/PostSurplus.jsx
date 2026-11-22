import { useState } from 'react'
import { ZONES } from '../data/seed.js'

const PRESETS = ['Veg Biryani', 'Paneer Curry', 'Dal & Rice', 'Mix Veg & Roti']
const PORTION_PRESETS = [20, 40, 60]
const PICKUP_PRESETS = [
  { hours: 1, label: '1 hr' },
  { hours: 2, label: '2 hrs' },
  { hours: 3, label: '3 hrs' }
]
const STORAGE_OPTIONS = {
  'Hot Box': 'Hold hot above 60°C in an insulated hot box until pickup.',
  Chilled: 'Keep chilled at 0-5°C. Do not leave out in transit.',
  'Room Temp': 'Room temperature only for a short window. Keep away from direct heat.'
}
const ALLERGENS = ['Dairy', 'Nuts', 'Gluten', 'Soy', 'None']
const SAMPLE_CATERER = 'Saffron Spoon Catering (demo)'
const STATUS_STYLES = {
  Posted: 'bg-amber-100 text-amber-800',
  Claimed: 'bg-green-100 text-green-800',
  Collected: 'bg-green-200 text-green-900',
  Delivered: 'bg-green-700 text-white'
}

const EMPTY = {
  foodName: '',
  diet: 'Veg',
  caterer: SAMPLE_CATERER,
  portions: '',
  zone: '',
  pickupHours: 0,
  storage: '',
  handling: '',
  allergens: [],
  confirmed: false
}

function pickupLabel(hours) {
  const at = new Date(Date.now() + hours * 3600000)
  const sameDay = at.toDateString() === new Date().toDateString()
  const hhmm = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
  return `${sameDay ? 'Today' : 'Tomorrow'}, ${hhmm}`
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
        active ? 'border-amber-500 bg-amber-500 text-white' : 'border-green-200 bg-white text-green-900 hover:bg-green-50'
      }`}
    >
      {children}
    </button>
  )
}

function FieldError({ msg }) {
  return msg ? <p className="mt-1 text-xs text-red-700">{msg}</p> : null
}

function Label({ children }) {
  return <p className="mb-2 text-sm font-semibold text-green-900">{children}</p>
}

export default function PostSurplus({ data, addListing, onNavigate, role, onRoleChange }) {
  const [form, setForm] = useState(EMPTY)
  const isDonor = role === 'Donor'
  const [errors, setErrors] = useState({})
  const [posted, setPosted] = useState(null)

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const toggleAllergen = (a) => {
    setForm((f) => {
      let next
      if (a === 'None') {
        next = f.allergens.includes('None') ? [] : ['None']
      } else {
        const base = f.allergens.filter((x) => x !== 'None')
        next = base.includes(a) ? base.filter((x) => x !== a) : [...base, a]
      }
      return { ...f, allergens: next }
    })
  }

  const validate = () => {
    const e = {}
    if (!form.foodName.trim()) e.foodName = 'Enter a food name or tap a preset.'
    if (!form.caterer.trim()) e.caterer = 'Enter the caterer name.'
    const p = Number(form.portions)
    if (!Number.isInteger(p) || p < 1) e.portions = 'Enter a whole number of portions (1 or more).'
    if (!form.zone) e.zone = 'Choose a zone.'
    if (!form.pickupHours) e.pickupHours = 'Choose a pickup window.'
    if (!form.storage) e.storage = 'Choose a storage condition.'
    if (form.allergens.length === 0) e.allergens = 'Tick at least one allergen, or None.'
    if (!form.confirmed) e.confirmed = 'Tick the confirmation box to post.'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    const notes = form.handling.trim()
    const listing = {
      id: `L-${Date.now().toString(36).toUpperCase()}`,
      caterer: form.caterer.trim(),
      foodName: form.foodName.trim(),
      diet: form.diet,
      portions: Number(form.portions),
      pickupBy: pickupLabel(form.pickupHours),
      pickupAt: Date.now() + form.pickupHours * 3600000,
      zone: form.zone,
      storageType: form.storage,
      storage: STORAGE_OPTIONS[form.storage],
      handlingNotes: notes,
      allergens: form.allergens,
      status: 'Posted',
      claimedBy: null,
      claimedAt: null,
      volunteerId: null,
      donorPosted: true,
      createdAt: Date.now()
    }
    addListing(listing)
    setPosted(listing)
    setForm(EMPTY)
    setErrors({})
  }

  const recent = data.listings
    .filter((l) => l.donorPosted)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-green-800">Post surplus</h2>
        <p className="text-sm text-green-900/70">Fill in the basics and post. Most donors finish in under a minute.</p>
      </section>

      {posted && (
        <section role="status" className="rounded-xl border border-green-300 bg-green-50 p-5 shadow-sm">
          <p className="font-semibold text-green-800">Listing posted: {posted.foodName}</p>
          <p className="mt-1 text-sm text-green-900/80">
            {posted.portions} portions from {posted.caterer} in {posted.zone}, pickup by {posted.pickupBy}. Status: Posted (ID {posted.id}).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onNavigate('Find Food')} className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
              Go to Find Food
            </button>
            <button type="button" onClick={() => setPosted(null)} className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-900 hover:bg-green-50">
              Post another
            </button>
          </div>
        </section>
      )}

      {!isDonor && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-6 shadow-sm">
          <p className="font-semibold text-amber-900">Only Donors can post surplus food.</p>
          <p className="mt-1 text-sm text-green-950/80">You are viewing as {role}. Switch to Donor to list leftover food from an event.</p>
          <button type="button" onClick={() => onRoleChange?.('Donor')} className="mt-4 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">Switch to Donor</button>
        </section>
      )}

      {isDonor && (
      <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-xl border border-green-100 bg-white p-6 shadow-sm">
        <div>
          <Label>Quick pick a common item</Label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Chip key={p} active={form.foodName === p} onClick={() => set({ foodName: p, diet: p === 'Paneer Curry' ? 'Veg' : form.diet })}>
                {p}
              </Chip>
            ))}
          </div>
          <label className="mt-3 block text-sm font-semibold text-green-900" htmlFor="foodName">Food name</label>
          <input
            id="foodName"
            type="text"
            value={form.foodName}
            onChange={(e) => set({ foodName: e.target.value })}
            placeholder="Or type a custom food name"
            className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <FieldError msg={errors.foodName} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>Veg / Non-Veg</Label>
            <div className="flex gap-2">
              {['Veg', 'Non-Veg'].map((d) => (
                <Chip key={d} active={form.diet === d} onClick={() => set({ diet: d })}>{d}</Chip>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900" htmlFor="caterer">Caterer name</label>
            <input
              id="caterer"
              type="text"
              value={form.caterer}
              onChange={(e) => set({ caterer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <FieldError msg={errors.caterer} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>Portions</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PORTION_PRESETS.map((n) => (
                <Chip key={n} active={Number(form.portions) === n} onClick={() => set({ portions: String(n) })}>{n}</Chip>
              ))}
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                aria-label="Custom portion count"
                placeholder="Custom"
                value={form.portions}
                onChange={(e) => set({ portions: e.target.value })}
                className="w-24 rounded-lg border border-green-200 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <FieldError msg={errors.portions} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900" htmlFor="zone">Zone</label>
            <select
              id="zone"
              value={form.zone}
              onChange={(e) => set({ zone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Choose a zone</option>
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <FieldError msg={errors.zone} />
          </div>
        </div>

        <div>
          <Label>Pickup by</Label>
          <div className="flex flex-wrap gap-2">
            {PICKUP_PRESETS.map((p) => (
              <Chip key={p.hours} active={form.pickupHours === p.hours} onClick={() => set({ pickupHours: p.hours })}>{p.label} from now</Chip>
            ))}
          </div>
          {form.pickupHours > 0 && <p className="mt-2 text-xs text-green-900/70">Pickup by {pickupLabel(form.pickupHours)}</p>}
          <FieldError msg={errors.pickupHours} />
        </div>

        <div>
          <Label>Storage condition</Label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(STORAGE_OPTIONS).map((s) => (
              <Chip key={s} active={form.storage === s} onClick={() => set({ storage: s })}>{s}</Chip>
            ))}
          </div>
          <FieldError msg={errors.storage} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-green-900" htmlFor="handling">Handling notes <span className="font-normal text-green-900/60">(optional)</span></label>
          <textarea
            id="handling"
            rows={2}
            value={form.handling}
            onChange={(e) => set({ handling: e.target.value })}
            placeholder="e.g. Ring the back gate on arrival. Packed in sealed trays."
            className="mt-1 w-full rounded-lg border border-green-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <Label>Allergens</Label>
          <div className="flex flex-wrap gap-3">
            {ALLERGENS.map((a) => (
              <label key={a} className="inline-flex items-center gap-2 text-sm text-green-900">
                <input
                  type="checkbox"
                  checked={form.allergens.includes(a)}
                  onChange={() => toggleAllergen(a)}
                  className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-amber-500"
                />
                {a}
              </label>
            ))}
          </div>
          <FieldError msg={errors.allergens} />
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <label className="inline-flex items-start gap-3 text-sm text-green-950">
            <input
              type="checkbox"
              checked={form.confirmed}
              onChange={(e) => set({ confirmed: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-amber-400 text-green-600 focus:ring-amber-500"
            />
            <span>I confirm these details are accurate. I understand RescueLoop only connects donors and receivers and does not certify food safety.</span>
          </label>
          <FieldError msg={errors.confirmed} />
        </div>

        <div className="flex items-center justify-end">
          <button type="submit" className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Post listing
          </button>
        </div>
      </form>
      )}

      <section className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-green-800">Recently Posted Listings</h3>
        {recent.length === 0 && <p className="mt-2 text-sm text-green-900/70">Nothing posted from this browser yet. Your listings will appear here with their status.</p>}
        <ul className="mt-3 divide-y divide-green-100">
          {recent.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium text-green-900">{l.foodName} · {l.portions} portions</p>
                <p className="text-green-900/70">{l.zone} · pickup by {l.pickupBy} · ID {l.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {(l.status === 'Claimed' || l.status === 'Collected') && l.handoverCode && (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold tracking-widest text-amber-900" title="Handover code: share with the volunteer at pickup">Handover {l.handoverCode}</span>
                )}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[l.status] ?? 'bg-green-50 text-green-900'}`}>{l.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
