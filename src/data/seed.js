export const ZONES = ['Madhapur', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Kondapur']
export const STATUSES = ['Posted', 'Claimed', 'Collected', 'Delivered']

const STORAGE_TEXT = {
  'Hot Box': 'Hold hot above 60°C in an insulated hot box until pickup.',
  Chilled: 'Keep chilled at 0-5°C. Do not leave out in transit.',
  'Room Temp': 'Room temperature only for a short window. Keep away from direct heat.'
}
function pickupLabel(ts, now) {
  const d = new Date(ts)
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const sameDay = d.toDateString() === new Date(now).toDateString()
  const day = sameDay ? 'Today' : d > new Date(now) ? 'Tomorrow' : 'Yesterday'
  return `${day}, ${hhmm}`
}
function make(f, now) {
  return {
    claimedBy: null, claimedAt: null, collectedAt: null, deliveredAt: null, volunteerId: null, donorPosted: false,
    ...f,
    pickupBy: pickupLabel(f.pickupAt, now),
    storage: STORAGE_TEXT[f.storageType]
  }
}

// Demo listings with every timestamp expressed relative to `now`.
// Posted listings have pickupAt in the future so their countdowns start active.
// Claimed/Collected/Delivered samples keep createdAt < claimedAt < collectedAt < deliveredAt, all in the past.
export function makeDemoListings(now = Date.now()) {
  const at = (minutes) => now + minutes * 60000
  return [
    make({ id: 'L-101', caterer: 'Saffron Spoon Catering (demo)', foodName: 'Veg Biryani', diet: 'Veg', portions: 40, pickupAt: at(45), zone: 'Madhapur', storageType: 'Hot Box', handlingNotes: 'Insulated containers; label with cook time.', allergens: ['Dairy'], status: 'Posted', createdAt: at(-60) }, now),
    make({ id: 'L-102', caterer: 'Harvest Plate Events (demo)', foodName: 'Dal, roti and rice platter', diet: 'Veg', portions: 60, pickupAt: at(150), zone: 'Gachibowli', storageType: 'Chilled', handlingNotes: 'Pack in sealed trays.', allergens: ['Gluten'], status: 'Posted', createdAt: at(-40) }, now),
    make({ id: 'L-103', caterer: 'Clay Oven Kitchens (demo)', foodName: 'Paneer tikka skewers', diet: 'Veg', portions: 25, pickupAt: at(30), zone: 'Jubilee Hills', storageType: 'Chilled', handlingNotes: 'Pack in insulated trays and keep sealed until handover.', allergens: ['Dairy'], status: 'Claimed', claimedBy: 'N-01', claimedAt: at(-20), createdAt: at(-120), handoverCode: '4821', handoverChecked: false }, now),
    make({ id: 'L-104', caterer: 'Deccan Feast Co. (demo)', foodName: 'Chicken haleem', diet: 'Non-Veg', portions: 30, pickupAt: at(-30), zone: 'Banjara Hills', storageType: 'Hot Box', handlingNotes: 'Discard if not held hot for more than 4 hours.', allergens: ['Gluten'], status: 'Collected', claimedBy: 'N-02', claimedAt: at(-90), collectedAt: at(-60), volunteerId: 'V-02', createdAt: at(-180), handoverCode: '7316', handoverChecked: true }, now),
    make({ id: 'L-105', caterer: 'Sweet Basil Events (demo)', foodName: 'Fruit and sweets box', diet: 'Veg', portions: 50, pickupAt: at(-300), zone: 'Kondapur', storageType: 'Room Temp', handlingNotes: 'Keep away from direct heat.', allergens: ['Nuts', 'Dairy'], status: 'Delivered', claimedBy: 'N-03', claimedAt: at(-330), collectedAt: at(-310), deliveredAt: at(-290), volunteerId: 'V-03', createdAt: at(-600), handoverCode: '2958', handoverChecked: true }, now),
    make({ id: 'L-106', caterer: 'Spice Route Banquets (demo)', foodName: 'Veg fried rice and manchurian', diet: 'Veg', portions: 35, pickupAt: at(-420), zone: 'Madhapur', storageType: 'Hot Box', handlingNotes: 'Cover tightly.', allergens: ['Soy', 'Gluten'], status: 'Delivered', claimedBy: 'N-04', claimedAt: at(-450), collectedAt: at(-430), deliveredAt: at(-400), volunteerId: 'V-01', createdAt: at(-700), handoverCode: '6042', handoverChecked: true }, now)
  ]
}

export const SEED = {
  listings: makeDemoListings(),
  ngos: [
    { id: 'N-01', name: 'Asha Community Kitchen (demo)', zone: 'Gachibowli', mealCapacity: 300, preferences: ['Vegetarian', 'Dal and rice'] },
    { id: 'N-02', name: 'Hope Shelter Kitchen (demo)', zone: 'Banjara Hills', mealCapacity: 200, preferences: ['Non-veg accepted', 'Hot meals'] },
    { id: 'N-03', name: 'Kindle Youth Meal Hub (demo)', zone: 'Kondapur', mealCapacity: 150, preferences: ['Sweets', 'Fruit'] },
    { id: 'N-04', name: 'Neighbourhood Table (demo)', zone: 'Madhapur', mealCapacity: 120, preferences: ['Vegetarian', 'No nuts'] }
  ],
  volunteers: [
    { id: 'V-01', name: 'Demo Volunteer A', zone: 'Madhapur', vehicle: 'Two-wheeler', availability: 'Evenings' },
    { id: 'V-02', name: 'Demo Volunteer B', zone: 'Banjara Hills', vehicle: 'Hatchback', availability: 'Weekends' },
    { id: 'V-03', name: 'Demo Volunteer C', zone: 'Kondapur', vehicle: 'Two-wheeler', availability: 'Weekdays' }
  ]
}

export default SEED
