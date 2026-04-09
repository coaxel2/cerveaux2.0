import { useState } from 'react'
import { useData } from '../hooks/useData'
import { statusColor, uid, formatDate, today } from '../utils/helpers'

const STATUSES = ['en cours', 'bloqué', 'à préparer', 'en pause', 'terminé']
const TAGS = ['tech', 'perso', 'automatisation', 'design', 'autre']

function ProgressBar({ value, status }) {
  const color = status === 'bloqué' ? 'var(--red)' : status === 'terminé' ? 'var(--accent)' : status === 'à préparer' ? 'var(--amber)' : 'var(--teal)'
  return <div className="bar-track" style={{ height: 6 }}><div className="bar-fill" style={{ width: `${value}%`, background: color, height: 6 }} /></div>
}

function ProjectCard({ project, onEdit, onDelete, onUpdate }) {
  const [showSubs, setShowSubs] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [subInput, setSubInput] = useState('')
  const [logInput, setLogInput] = useState('')

  function addSubtask() {
    if (!subInput.trim()) return
    const subtasks = [...(project.subtasks || []), { id: uid(), title: subInput.trim(), done: false }]
    onUpdate(project.id, { subtasks })
    setSubInput('')
  }

  function toggleSubtask(subId) {
    const subtasks = (project.subtasks || []).map(s => s.id === subId ? { ...s, done: !s.done } : s)
    onUpdate(project.id, { subtasks })
  }

  function deleteSubtask(subId) {
    onUpdate(project.id, { subtasks: (project.subtasks || []).filter(s => s.id !== subId) })
  }

  function addLog() {
    if (!logInput.trim()) return
    const log = [...(project.log || []), { id: uid(), date: today(), note: logInput.trim() }]
    onUpdate(project.id, { log })
    setLogInput('')
  }

  const doneSubtasks = (project.subtasks || []).filter(s => s.done).length
  const totalSubtasks = (project.subtasks || []).length

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-head">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{project.title}</span>
          <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ fontSize: 11, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onEdit(project)}>éditer</button>
          <button style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onDelete(project.id)}>suppr.</button>
        </div>
      </div>

      {project.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>{project.description}</p>}

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>avancement</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} status={project.status} />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        {project.nextStep && <div>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 2 }}>PROCHAINE ÉTAPE</span>
          <span style={{ fontSize: 12, color: 'var(--text)' }}>{project.nextStep}</span>
        </div>}
        {project.deadline && <div>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 2 }}>ÉCHÉANCE</span>
          <span style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{formatDate(project.deadline)}</span>
        </div>}
      </div>

      {project.tags?.length > 0 && <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>{project.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>}

      {/* Sous-tâches */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <button
          onClick={() => setShowSubs(v => !v)}
          style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>{showSubs ? '▾' : '▸'}</span>
          Sous-tâches {totalSubtasks > 0 && <span style={{ color: doneSubtasks === totalSubtasks ? 'var(--accent)' : 'var(--text3)' }}>({doneSubtasks}/{totalSubtasks})</span>}
        </button>
        {showSubs && (
          <div style={{ marginTop: 10 }}>
            {(project.subtasks || []).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <button
                  onClick={() => toggleSubtask(s.id)}
                  style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${s.done ? 'var(--accent)' : 'var(--border2)'}`, background: s.done ? 'var(--accent)' : 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
                >{s.done ? '✓' : ''}</button>
                <span style={{ fontSize: 13, flex: 1, color: s.done ? 'var(--text3)' : 'var(--text)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</span>
                <button onClick={() => deleteSubtask(s.id)} style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input placeholder="Ajouter une sous-tâche..." value={subInput} onChange={e => setSubInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubtask()} style={{ flex: 1, fontSize: 12, padding: '6px 10px' }} />
              <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={addSubtask}>+</button>
            </div>
          </div>
        )}
      </div>

      {/* Journal de bord */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10 }}>
        <button
          onClick={() => setShowLog(v => !v)}
          style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>{showLog ? '▾' : '▸'}</span>
          Journal de bord {(project.log || []).length > 0 && <span>({(project.log || []).length})</span>}
        </button>
        {showLog && (
          <div style={{ marginTop: 10 }}>
            {(project.log || []).slice().reverse().map(entry => (
              <div key={entry.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{entry.date}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{entry.note}</div>
              </div>
            ))}
            {(project.log || []).length === 0 && <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', padding: '8px 0' }}>Aucune entrée</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input placeholder="Note d'avancement..." value={logInput} onChange={e => setLogInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLog()} style={{ flex: 1, fontSize: 12, padding: '6px 10px' }} />
              <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={addLog}>+</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const emptyForm = { title: '', description: '', status: 'en cours', progress: 0, nextStep: '', deadline: '', tags: [] }

export default function Projects() {
  const { data: projects, save } = useData('projects')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('tout')

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function toggleTag(t) { setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] })) }

  function saveProject() {
    if (!form.title.trim()) return
    const updated = editing
      ? (projects || []).map(p => p.id === editing ? { ...p, ...form } : p)
      : [...(projects || []), { id: uid(), ...form, subtasks: [], log: [] }]
    save(updated)
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
  }

  function updateProject(id, patch) {
    save((projects || []).map(p => p.id === id ? { ...p, ...patch } : p))
  }

  function startEdit(p) { setForm({ ...emptyForm, ...p }); setEditing(p.id); setShowForm(true) }
  function deleteProject(id) { save((projects || []).filter(p => p.id !== id)) }

  const filtered = (projects || []).filter(p => filterStatus === 'tout' || p.status === filterStatus)
  const statusCounts = (projects || []).reduce((a, p) => { a[p.status] = (a[p.status] || 0) + 1; return a }, {})

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projets</h1>
          <div className="page-sub">{projects?.length || 0} PROJETS</div>
        </div>
        <button className="btn btn-accent" onClick={() => { setShowForm(v => !v); setEditing(null); setForm(emptyForm) }}>
          {showForm ? 'Annuler' : '+ Nouveau projet'}
        </button>
      </div>

      <div className="page-content">
        {showForm && (
          <div className="card">
            <div className="card-head"><span className="card-title">{editing ? 'Modifier le projet' : 'Nouveau projet'}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Titre du projet" value={form.title} onChange={e => setF('title', e.target.value)} />
              <textarea placeholder="Description..." value={form.description} onChange={e => setF('description', e.target.value)} style={{ minHeight: 60 }} />
              <div className="form-row" style={{ gap: 10 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Statut</label>
                  <select value={form.status} onChange={e => setF('status', e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Avancement (%)</label>
                  <div className="range-wrap">
                    <input type="range" min="0" max="100" step="5" value={form.progress} onChange={e => setF('progress', parseInt(e.target.value))} />
                    <span className="range-val">{form.progress}%</span>
                  </div>
                </div>
              </div>
              <input placeholder="Prochaine étape concrète..." value={form.nextStep} onChange={e => setF('nextStep', e.target.value)} />
              <div className="form-group">
                <label className="form-label">Échéance</label>
                <input type="date" value={form.deadline} onChange={e => setF('deadline', e.target.value)} style={{ width: 'auto' }} />
              </div>
              <div>
                <div className="form-label" style={{ marginBottom: 6 }}>Tags</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TAGS.map(t => <button key={t} className={`btn ${form.tags.includes(t) ? 'btn-accent' : 'btn-ghost'}`} style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => toggleTag(t)}>{t}</button>)}
                </div>
              </div>
              <button className="btn btn-accent" onClick={saveProject}>{editing ? 'Mettre à jour' : 'Créer le projet'}</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`btn ${filterStatus === 'tout' ? 'btn-accent' : 'btn-ghost'}`} style={{ fontSize: 11 }} onClick={() => setFilterStatus('tout')}>tout ({projects?.length || 0})</button>
          {Object.entries(statusCounts).map(([s, n]) => (
            <button key={s} className={`btn ${filterStatus === s ? 'btn-accent' : 'btn-ghost'}`} style={{ fontSize: 11 }} onClick={() => setFilterStatus(s)}>{s} ({n})</button>
          ))}
        </div>

        {filtered.length === 0
          ? <div className="empty-state">Aucun projet dans ce filtre</div>
          : filtered.map(p => <ProjectCard key={p.id} project={p} onEdit={startEdit} onDelete={deleteProject} onUpdate={updateProject} />)
        }
      </div>
    </>
  )
}
