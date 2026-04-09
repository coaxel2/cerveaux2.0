import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import Auth from './pages/Auth'
import Dashboard from './modules/Dashboard'
import Journal from './modules/Journal'
import Ideas from './modules/Ideas'
import Projects from './modules/Projects'
import Tasks from './modules/Tasks'
import Habits from './modules/Habits'
import Stats from './modules/Stats'
import Search from './components/Search'

const MODULES = [
  { id: 'dashboard', label: "Vue d'ensemble", icon: '◈' },
  { id: 'journal',   label: 'Journée',        icon: '◷' },
  { id: 'tasks',     label: 'Tâches',          icon: '◻' },
  { id: 'habits',    label: 'Habitudes',       icon: '◉' },
  { id: 'ideas',     label: 'Idées',           icon: '◇' },
  { id: 'projects',  label: 'Projets',         icon: '◫' },
  { id: 'stats',     label: 'Statistiques',    icon: '◬' },
]

const PAGES = { dashboard: Dashboard, journal: Journal, tasks: Tasks, habits: Habits, ideas: Ideas, projects: Projects, stats: Stats }

function exportData(auth) {
  const keys = ['journal', 'ideas', 'projects', 'tasks', 'habits']
  const data = {}
  keys.forEach(k => {
    try { data[k] = JSON.parse(localStorage.getItem(`cerveau2_${k}`) || '[]') } catch { data[k] = [] }
  })
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), user: auth.user.email, ...data }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cerveau2-export-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const { auth, login, register, logout } = useAuth()
  const [active, setActive] = useState('dashboard')
  const [showSearch, setShowSearch] = useState(false)

  if (!auth) return <Auth onLogin={login} onRegister={register} />

  const Page = PAGES[active]
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()

  return (
    <div className="app">
      {showSearch && <Search onClose={() => setShowSearch(false)} />}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-title">Cerveau 2.0</div>
          <div className="sidebar-logo-sub" style={{ color: 'var(--accent)' }}>{auth.user.name}</div>
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
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={() => setShowSearch(true)}
              style={{ flex: 1, fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', padding: '6px', fontFamily: 'var(--font-mono)' }}
            >⌕ Recherche</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              onClick={() => exportData(auth)}
              style={{ flex: 1, fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', textAlign: 'left' }}
            >↓ Exporter</button>
            <button
              onClick={logout}
              style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >déco.</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <Page />
      </main>
    </div>
  )
}
