const DESCRIPTIONS = {
  'Impact Dashboard': 'A summary of meals rescued, kilograms diverted, and partner activity.',
  'Find Food': 'Browse nearby surplus food listings from event caterers.',
  'Post Surplus': 'List leftover food from an event so receivers and volunteers can claim it.',
  'My Pickups': 'Track the pickups you have claimed or scheduled.',
  History: 'A record of completed rescues and handovers.'
}

export default function PlaceholderPage({ tab, role }) {
  return (
    <section className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-green-800">{tab}</h2>
      <p className="mt-1 text-sm font-medium text-amber-700">Viewing as {role}</p>
      <p className="mt-3 text-green-950/80">{DESCRIPTIONS[tab]}</p>
    </section>
  )
}
