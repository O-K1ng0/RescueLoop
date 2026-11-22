import RoleSwitcher from './RoleSwitcher.jsx'
import Logo from './Logo.jsx'

export default function TopBar({ role, onRoleChange, roles, onReset }) {
  return (
    <header className="border-b border-green-100 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-xl font-bold text-green-700">RescueLoop</h1>
            <p className="text-xs text-green-900/70">Surplus food rescue · Hyderabad</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RoleSwitcher role={role} onChange={onRoleChange} roles={roles} />
          <button
            type="button"
            onClick={() => { if (window.confirm('Reset all demo data to the original samples?')) onReset() }}
            className="rounded-full border border-amber-300 bg-transparent px-3 py-1.5 text-sm font-medium text-amber-800 transition-all duration-200 hover:bg-amber-50 hover:border-amber-400"
          >
            Reset Demo
          </button>
        </div>
      </div>
    </header>
  )
}
