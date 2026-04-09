import { useState } from 'react'
import Dashboard from './modules/Dashboard'
import Journal from './modules/Journal'
import Ideas from './modules/Ideas'
import Projects from './modules/Projects'

const MODULES = [
  { id: 'dashboard', label: "Vue d'ensemble", icon: '◈' },
  { id: 'journal',   label: 'Journée',        icon: '◷' },
  { id: 'ideas',     label: 'Idées',           icon: '◇' },
  { id: 'projects',  label: 'Projets',         icon: '◫' },
]

export default function App() {
  const [active, setActive] = useState('dashboard')

  const Page = { dashboard: Dashboard, journal: Journal, ideas: Ideas, projects: Projects }[active]
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">Cerveau 2.0</div>
          <div className="sidebar-logo-sub">v1.0</div>
        </div>
        <nav className="sidebar-nav">
          {MODULES.map(m => (
            <button key={m.id} className={`nav-item ${active === m.id ? 'active' : ''}`} onClick={() => setActive(m.id)}>
              <span className="nav-icon">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-date">{dateStr}</div>
        </div>
      </aside>
      <main className="main">
        <Page />
      </main>
    </div>
  )
}
