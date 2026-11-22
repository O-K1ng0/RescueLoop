export const NEARBY = {
  Madhapur: ['Gachibowli', 'Kondapur', 'Jubilee Hills'],
  Gachibowli: ['Madhapur', 'Kondapur'],
  Kondapur: ['Madhapur', 'Gachibowli'],
  'Banjara Hills': ['Jubilee Hills'],
  'Jubilee Hills': ['Banjara Hills', 'Madhapur']
}

// Same zone first, then nearby zone, then fewest active pickups.
export function suggestVolunteerId(zone, volunteers, listings) {
  const active = (vid) => listings.filter((l) => l.volunteerId === vid && (l.status === 'Claimed' || l.status === 'Collected')).length
  const rank = (v) => (v.zone === zone ? 0 : NEARBY[zone]?.includes(v.zone) ? 1 : 2)
  const best = [...volunteers].sort((a, b) => rank(a) - rank(b) || active(a.id) - active(b.id))[0]
  return best ? best.id : null
}
