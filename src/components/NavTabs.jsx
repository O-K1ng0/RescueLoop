export default function NavTabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="border-b border-green-100 bg-white">
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
        {tabs.map((t) => {
          const active = t === activeTab
          return (
            <li key={t} className="shrink-0">
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onChange(t)}
                className={`relative px-3 py-3 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  active ? 'text-green-700' : 'text-green-900/70 hover:text-green-800'
                }`}
              >
                {t}
                {active && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-emerald-600" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
