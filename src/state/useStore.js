import { useCallback, useEffect, useState } from 'react'
import { SEED, makeDemoListings } from '../data/seed.js'

export const STORAGE_KEY = 'rescueloop.v1'
const SIX_HOURS_MS = 6 * 60 * 60 * 1000

function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function backfillHandover(l) {
  if (l.status !== 'Claimed' && l.status !== 'Collected') return l
  const patch = {}
  if (typeof l.handoverCode !== 'string') patch.handoverCode = randomCode()
  if (typeof l.handoverChecked !== 'boolean') patch.handoverChecked = l.status === 'Collected'
  return Object.keys(patch).length ? { ...l, ...patch } : l
}

function freshSeed() {
  return { ...SEED, listings: makeDemoListings(Date.now()) }
}

// True only when there are Posted listings and every one is expired by more than 6 hours.
function allPostedExpired(listings) {
  const posted = listings.filter((l) => l.status === 'Posted')
  if (posted.length === 0) return false
  const cutoff = Date.now() - SIX_HOURS_MS
  return posted.every((l) => l.pickupAt < cutoff)
}

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const valid = parsed && Array.isArray(parsed.listings) && Array.isArray(parsed.ngos) && Array.isArray(parsed.volunteers) && parsed.listings.every((l) => typeof l.pickupAt === 'number')
      if (valid) {
        if (allPostedExpired(parsed.listings)) return freshSeed()
        return { ...parsed, listings: parsed.listings.map(backfillHandover) }
      }
    }
  } catch {
    // corrupted: fall back to seed
  }
  return SEED
}

export function useStore() {
  const [data, setData] = useState(load)

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* storage blocked */ }
  }, [data])

  const addListing = useCallback((listing) => {
    setData((d) => ({ ...d, listings: [listing, ...d.listings] }))
  }, [])

  const updateListing = useCallback((id, patch) => {
    setData((d) => ({ ...d, listings: d.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
  }, [])

  const claimListing = useCallback((id, ngoId) => {
    setData((d) => ({
      ...d,
      listings: d.listings.map((l) =>
        l.id === id && l.status === 'Posted' && !l.claimedBy
          ? { ...l, status: 'Claimed', claimedBy: ngoId, claimedAt: Date.now(), handoverCode: randomCode(), handoverChecked: false }
          : l
      )
    }))
  }, [])

  const assignVolunteer = useCallback((id, volunteerId) => {
    setData((d) => ({
      ...d,
      listings: d.listings.map((l) =>
        l.id === id && (l.status === 'Claimed' || l.status === 'Collected') ? { ...l, volunteerId } : l
      )
    }))
  }, [])

  const markCollected = useCallback((id, volunteerId) => {
    setData((d) => ({
      ...d,
      listings: d.listings.map((l) =>
        l.id === id && l.status === 'Claimed'
          ? { ...l, status: 'Collected', collectedAt: Date.now(), volunteerId: volunteerId ?? l.volunteerId, handoverChecked: true }
          : l
      )
    }))
  }, [])

  const markDelivered = useCallback((id) => {
    setData((d) => ({
      ...d,
      listings: d.listings.map((l) =>
        l.id === id && l.status === 'Collected' ? { ...l, status: 'Delivered', deliveredAt: Date.now() } : l
      )
    }))
  }, [])

  const resetDemo = useCallback(() => {
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setData(freshSeed())
  }, [])

  return { data, addListing, updateListing, claimListing, assignVolunteer, markCollected, markDelivered, resetDemo }
}
