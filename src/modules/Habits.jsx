import { useState } from 'react'
import { useData } from '../hooks/useData'
import { today, getStreak, uid } from '../utils/helpers'

const EMOJIS = ['📚', '🏃', '💪', '🧘', '🥗', '💧', '🛌', '🎯', '✍️', '🎸', '🧹', '💊']

function HabitGrid({ completions }) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  const set = new Set(completions || [])
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {days.map(d => (
        <div key={d} title={d} style={{
          width: 10, height: 10, borderRadius: 2,
          background: set.has(d) ? 'var(--accent)' : 'var(--bg4)'
        }} />
      ))}
    </div>
  )
}

export default function Habits() {
  const { data: habits, save } = useData('habits')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', emoji: '📚' })
  const todayStr = today()

  function toggleCompletion(habitId) {
    const updated = (habits || []).map(h => {
      if (h.id !== habitId) return h
      const completions = h.completions || []
      const has = completions.includes(todayStr)
      return { ...h, completions: has ? completions.filter(d => d !== todayStr) : [...completions, todayStr] }
    })
    save(updated)
  }

  function addHabit() {
    if (!form.name.trim()) return
    save([...(habits || []), { id: uid(), name: form.name.trim(), emoji: form.emoji, completions: [], createdAt: new Date().toISOString() }])
    setForm({ name: '', emoji: '📚' })
    setShowForm(false)
  }

  function deleteHabit(id) {
    save((habits || []).filter(h => h.id !== id))
  }

  const doneToday = (habits || []).filter(h => (h.completions || []).includes(todayStr)).length
  const total = (habits || []).length

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Habitudes</h1>
          <div className="page-sub">{doneToday}/{total} AUJOURD'HUI</div>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Habitude'}
        </button>
      </div>

      <div className="page-content">
        {showForm && (
          <div className="card">
            <div className="card-head"><span className="card-title">Nouvelle habitude</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Nom de l'habitude..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addHabit()} style={{ flex: 1 }} />
                <button className="btn btn-accent" onClick={addHabit}>Créer</button>
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>Emoji</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      style={{ fontSize: 20, background: form.emoji === e ? 'var(--bg4)' : 'none', border: `1px solid ${form.emoji === e ? 'var(--border2)' : 'transparent'}`, borderRadius: 8, padding: '4px 6px', cursor: 'pointer' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today check-ins */}
        <div className="card">
          <div className="card-head"><span className="card-title">Aujourd'hui</span></div>
          {(habits || []).length === 0
            ? <div className="empty-state">Aucune habitude créée</div>
            : (habits || []).map(habit => {
              const done = (habit.completions || []).includes(todayStr)
              const streak = getStreak(habit.completions)
              return (
                <div key={habit.id} className="row" style={{ alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => toggleCompletion(habit.id)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: done ? 'var(--accent)' : 'var(--bg4)',
                      border: `2px solid ${done ? 'var(--accent)' : 'var(--border2)'}`,
                      cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {done ? '✓' : ''}
                  </button>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{habit.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, color: done ? 'var(--text)' : 'var(--text2)' }}>{habit.name}</span>
                  {streak > 0 && (
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>🔥 {streak}j</span>
                  )}
                  <button onClick={() => deleteHabit(habit.id)} style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              )
            })
          }
        </div>

        {/* History grid */}
        {(habits || []).length > 0 && (
          <div className="card">
            <div className="card-head"><span className="card-title">30 derniers jours</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(habits || []).map(habit => (
                <div key={habit.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>{habit.emoji}</span>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{habit.name}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text3)', marginLeft: 'auto' }}>
                      {(habit.completions || []).filter(d => {
                        const cut = new Date(); cut.setDate(cut.getDate() - 30)
                        return new Date(d) >= cut
                      }).length}/30 jours
                    </span>
                  </div>
                  <HabitGrid completions={habit.completions} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
