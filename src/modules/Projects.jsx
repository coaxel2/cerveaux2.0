import { useState } from 'react'
import { useData } from '../hooks/useData'
import { useAI } from '../hooks/useAI'
import { statusColor, uid, formatDate } from '../utils/helpers'

const STATUSES = ['en cours', 'bloqué', 'à préparer', 'en pause', 'terminé']
const TAGS = ['tech', 'perso', 'automatisation', 'design', 'autre']

function ProgressBar({ value, status }) {
  const color = status === 'bloqué' ? 'var(--red)'
    : status === 'terminé' ? 'var(--accent)'
    : status === 'à préparer' ? 'var(--amber)'
    : 'var(--teal)'
  return (
    <div className="bar-track" style={{ height: 6 }}>
      <div className="bar-fill" style={{ width: `${value}%`, background: color, height: 6 }} />
    </div>
  )
}

function ProjectCard({ project, onEdit, onAI, onDelete }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-head">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{project.title}</span>
          <span className={`badge ${statusColor(project.status)}`}>{project.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ fontSize: 11, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onAI(project)}>IA</button>
          <button style={{ fontSize: 11, color: 'var(--text2)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onEdit(project)}>éditer</button>
          <button style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onDelete(project.id)}>suppr.</button>
        </div>
      </div>

      {project.description && (
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>{project.description}</p>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>avancement</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} status={project.status} />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {project.nextStep && (
          <div>
            <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 2 }}>PROCHAINE ÉTAPE</span>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>{project.nextStep}</span>
          </div>
        )}
        {project.deadline && (
          <div>
            <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 2 }}>ÉCHÉANCE</span>
            <span style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{formatDate(project.deadline)}</span>
          </div>
        )}
      </div>

      {project.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  )
}

const emptyForm = { title: '', description: '', status: 'en cours', progress: 0, nextStep: '', deadline: '', tags: [] }

export default function Projects() {
  const { data: projects, save, loading } = useData('projects')
  const { data: context } = useData('context')
  const { ask, loading: aiLoading } = useAI()

  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [aiText, setAiText] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [filterStatus, setFilterStatus] = useState('tout')

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function toggleTag(t) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]
    }))
  }

  async function saveProject() {
    if (!form.title.trim()) return
    let updated
    if (editing) {
      updated = (projects || []).map(p => p.id === editing ? { ...p, ...form } : p)
    } else {
      updated = [...(projects || []), { id: uid(), ...form }]
    }
    await save(updated)
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(p) {
    setForm({ ...emptyForm, ...p })
    setEditing(p.id)
    setShowForm(true)
  }

  async function deleteProject(id) {
    await save((projects || []).filter(p => p.id !== id))
    if (selectedProject?.id === id) { setSelectedProject(null); setAiText('') }
  }

  async function analyseProject(p) {
    setSelectedProject(p)
    setAiText('')
    const prompt = p.status === 'bloqué'
      ? `Ce projet est bloqué. Propose 3 solutions concrètes pour le débloquer et relancer la progression.`
      : `Analyse ce projet et propose un plan d'action pour les 2 prochaines semaines avec des étapes précises.`
    const result = await ask(prompt, context,
      `Projet : "${p.title}"\nStatut : ${p.status}\nAvancement : ${p.progress}%\nDescription : ${p.description || 'aucune'}\nProchaine étape : ${p.nextStep || 'non définie'}`
    )
    if (result) setAiText(result)
  }

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
            <div className="card-head">
              <span className="card-title">{editing ? 'Modifier le projet' : 'Nouveau projet'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Titre du projet" value={form.title} onChange={e => setF('title', e.target.value)} />
              <textarea placeholder="Description..." value={form.description} onChange={e => setF('description', e.target.value)} style={{ minHeight: 60 }} />
              <div className="form-row" style={{ gap: 10 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Statut</label>
                  <select value={form.status} onChange={e => setF('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
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
                  {TAGS.map(t => (
                    <button
                      key={t}
                      className={`btn ${form.tags.includes(t) ? 'btn-accent' : 'btn-ghost'}`}
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={() => toggleTag(t)}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-accent" onClick={saveProject} disabled={loading}>
                {editing ? 'Mettre à jour' : 'Créer le projet'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`btn ${filterStatus === 'tout' ? 'btn-accent' : 'btn-ghost'}`} style={{ fontSize: 11 }} onClick={() => setFilterStatus('tout')}>
            tout ({projects?.length || 0})
          </button>
          {Object.entries(statusCounts).map(([s, n]) => (
            <button key={s} className={`btn ${filterStatus === s ? 'btn-accent' : 'btn-ghost'}`} style={{ fontSize: 11 }} onClick={() => setFilterStatus(s)}>
              {s} ({n})
            </button>
          ))}
        </div>

        <div className="grid-2">
          <div>
            {filtered.length === 0
              ? <div className="empty-state">Aucun projet dans ce filtre</div>
              : filtered.map(p => (
                <ProjectCard key={p.id} project={p} onEdit={startEdit} onAI={analyseProject} onDelete={deleteProject} />
              ))
            }
          </div>

          <div>
            <div className="card" style={{ position: 'sticky', top: 0 }}>
              <div className="card-head">
                <span className="card-title">
                  {selectedProject ? selectedProject.title.slice(0, 28) + '...' : 'Analyse IA'}
                </span>
              </div>
              {aiLoading
                ? <div className="ai-loading"><div className="dot-pulse"><span /><span /><span /></div><span>Analyse en cours...</span></div>
                : aiText
                  ? <div className="ai-output">{aiText}</div>
                  : <div className="ai-output" style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      Clique sur "IA" sur un projet pour obtenir un plan d'action ou des pistes de déblocage.
                    </div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
