import { useState } from 'react'
import TopBar from './components/TopBar.jsx'
import NavTabs from './components/NavTabs.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import ImpactDashboard from './pages/ImpactDashboard.jsx'
import FindFood from './pages/FindFood.jsx'
import PostSurplus from './pages/PostSurplus.jsx'
import MyPickups from './pages/MyPickups.jsx'
import History from './pages/History.jsx'
import Footer from './components/Footer.jsx'
import { useStore } from './state/useStore.js'

export const ROLES = ['Donor', 'Receiver', 'Volunteer']
export const TABS = ['Impact Dashboard', 'Find Food', 'Post Surplus', 'My Pickups', 'History']

export default function App() {
  const [role, setRole] = useState('Donor')
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [zoneFilter, setZoneFilter] = useState('All')
  const { data, addListing, claimListing, assignVolunteer, markCollected, markDelivered, resetDemo } = useStore()

  let page
  if (activeTab === 'Impact Dashboard') page = <ImpactDashboard data={data} onNavigate={setActiveTab} onRoleChange={setRole} zoneFilter={zoneFilter} onZoneSelect={(zone) => { setZoneFilter(zone); setActiveTab('Find Food') }} onZoneClear={() => setZoneFilter('All')} />
  else if (activeTab === 'Find Food') page = <FindFood data={data} role={role} claimListing={claimListing} onNavigate={setActiveTab} onRoleChange={setRole} zoneFilter={zoneFilter} onZoneChange={setZoneFilter} />
  else if (activeTab === 'Post Surplus') page = <PostSurplus data={data} role={role} addListing={addListing} onNavigate={setActiveTab} onRoleChange={setRole} />
  else if (activeTab === 'My Pickups') page = <MyPickups data={data} role={role} assignVolunteer={assignVolunteer} markCollected={markCollected} markDelivered={markDelivered} onNavigate={setActiveTab} onRoleChange={setRole} />
  else if (activeTab === 'History') page = <History data={data} />
  else page = <PlaceholderPage tab={activeTab} role={role} />

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-xs print:hidden">
        <TopBar role={role} onRoleChange={setRole} roles={ROLES} onReset={resetDemo} />
        <NavTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6"><div key={activeTab} className="animate-fade-slide-in">{page}</div></main>
      <Footer />
    </div>
  )
}
