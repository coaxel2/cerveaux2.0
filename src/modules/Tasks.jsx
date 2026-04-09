import { useState } from 'react'
import { useData } from '../hooks/useData'
import { today, uid } from '../utils/helpers'

const PRIORITIES = ['haute', 'normale', 'basse']
const PCOLOR = { haute: 'var(--red)', normale: 'var(--accent)', basse: 'var(--text3)' }
const PBADGE = { haute: 'badge-red', normale: 'badge-accent', basse: 'badge-gray' }

export default function Tasks() {
  const { data: tasks, save } = useData('tasks')
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('normale')
  const [viewDate, setViewDate] = useState(today())

  const todayTasks = (tasks || []).filter(t => t.date === viewDate)
  const done = todayTasks.filter(t => t.done).length
  const total = todayTasks.length

  function addTask() {
    if (!input.trim()) return
    const newTask = { id: uid(), date: viewDate, title: input.trim(), priority, done: false, createdAt: new Date().toISOString() }
    save([...(tasks || []), newTask])
    setInput('')
  }

  function toggleDone(id) {
    save((tasks || []).map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTask(id) {
    save((tasks || []).filter(t => t.id !== id))
  }

  const sorted = [...todayTasks].sort((a, b) => {
    const order = { haute: 0, normale: 1, basse: 2 }
    if (a.done !== b.done) return a.done ? 1 : -1
    return order[a.priority] - order[b.priority]
  })

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tâches</h1>
          <div className="page-sub">{done}/{total} COMPLÉTÉES</div>
        </div>
        <input
          type="date"
          value={viewDate}
          onChange={e => setViewDate(e.target.value)}
          style={{ width: 'auto', fontSize: 12, padding: '6px 10px' }}
        />
      </div>

      <div className="page-content">
        {/* Progress */}
        {total > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="bar-track" style={{ flex: 1, height: 6 }}>
              <div className="bar-fill" style={{ width: `${(done / total) * 100}%`, background: done === total ? 'var(--accent)' : 'var(--teal)' }} />
            </div>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text3)', flexShrink: 0 }}>
              {Math.round((done / total) * 100)}%
            </span>
          </div>
        )}

        {/* Add task */}
        <div className="card">
          <div className="card-head"><span className="card-title">Nouvelle tâche</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Que dois-tu faire ?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              style={{ flex: 1, fontSize: 14 }}
            />
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: 'auto', fontSize: 12 }}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
            <button className="btn btn-accent" onClick={addTask} style={{ flexShrink: 0 }}>Ajouter</button>
          </div>
        </div>

        {/* Task list */}
        <div className="card">
          {sorted.length === 0
            ? <div className="empty-state">Aucune tâche pour ce jour</div>
            : sorted.map(task => (
              <div key={task.id} className="row" style={{ alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => toggleDone(task.id)}
                  style={{
                    width: 20, height: 20, borderRadius: '50%', border: `2px solid ${PCOLOR[task.priority]}`,
                    background: task.done ? PCOLOR[task.priority] : 'transparent',
                    flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {task.done && <span style={{ color: '#0d0d0f', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </button>
                <span style={{
                  flex: 1, fontSize: 14,
                  color: task.done ? 'var(--text3)' : 'var(--text)',
                  textDecoration: task.done ? 'line-through' : 'none'
                }}>
                  {task.title}
                </span>
                <span className={`badge ${PBADGE[task.priority]}`}>{task.priority}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >✕</button>
              </div>
            ))
          }
        </div>

        {/* Stats rapides */}
        {tasks && tasks.length > 0 && (() => {
          const allDates = [...new Set(tasks.map(t => t.date))].sort().reverse().slice(0, 7)
          return (
            <div className="card">
              <div className="card-head"><span className="card-title">7 derniers jours</span></div>
              {allDates.map(date => {
                const dayTasks = tasks.filter(t => t.date === date)
                const dayDone = dayTasks.filter(t => t.done).length
                const pct = dayTasks.length ? Math.round((dayDone / dayTasks.length) * 100) : 0
                return (
                  <div key={date} className="row" style={{ alignItems: 'center' }}>
                    <span className="row-label" style={{ width: 90, cursor: 'pointer' }} onClick={() => setViewDate(date)}>
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--accent)' : 'var(--teal)' }} />
                    </div>
                    <span className="row-val">{dayDone}/{dayTasks.length}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </>
  )
}
