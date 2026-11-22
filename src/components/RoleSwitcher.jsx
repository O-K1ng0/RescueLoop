export default function RoleSwitcher({ role, onChange, roles }) {
  return (
    <div role="group" aria-label="Switch role" className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50/90 p-1">
      {roles.map((r) => {
        const active = r === role
        return (
          <button
            key={r}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(r)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              active ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200' : 'text-emerald-800/70 hover:text-emerald-900'
            }`}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}
