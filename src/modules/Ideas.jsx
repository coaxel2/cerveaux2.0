import { useState } from 'react'
import { useData } from '../hooks/useData'
import { useAI } from '../hooks/useAI'
import { timeAgo, catColor, statusColor, uid } from '../utils/helpers'

const CATS = ['tech', 'perso', 'projet', 'autre']
const STATUSES = ['à explorer', 'en cours', 'terminé', 'abandonné']

function IdeaCard({ idea, onDevelop, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card card-sm" style={{ marginBottom: 10 }}>
      <div className="card-head" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
          <span className={`badge ${catColor(idea.category)}`}>{idea.category}</span>
          <span className={`badge ${statusColor(idea.status)}`}>{idea.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            style={{ fontSize: 11, color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onDevelop(idea)}
          >développer</button>
          <button
            style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onDelete(idea.id)}
          >suppr.</button>
        </div>
      </div>
      <div
        style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, cursor: 'pointer' }}
        onClick={() => setExpanded(v => !v)}
      >
        {idea.title}
      </div>
      {expanded && idea.body && (
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginTop: 6 }}>{idea.body}</p>
      )}
      <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
        {timeAgo(idea.createdAt)}
      </div>
    </div>
  )
}

export default function Ideas() {
  const { data: ideas, save, loading } = useData('ideas')
  const { data: context } = useData('context')
  const { ask, loading: aiLoading } = useAI()

  const [form, setForm] = useState({ title: '', body: '', category: 'tech', status: 'à explorer' })
  const [filterCat, setFilterCat] = useState('tout')
  const [aiText, setAiText] = useState('')
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [saved, setSaved] = useState(false)

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function addIdea() {
    if (!form.title.trim()) return
    const newIdea = {
      id: uid(),
      ...form,
      createdAt: new Date().toISOString()
    }
    const updated = [newIdea, ...(ideas || [])]
    await save(updated)
    setForm({ title: '', body: '', category: 'tech', status: 'à explorer' })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function develop(idea) {
    setSelectedIdea(idea)
    setAiText('')
    const result = await ask(
      `Développe cette idée et propose 3 façons concrètes et actionnables de la mettre en oeuvre, avec des premières étapes précises.`,
      context,
      `Idée : "${idea.title}"\nDescription : ${idea.body || 'aucune'}\nCatégorie : ${idea.category}`
    )
    if (result) setAiText(result)
  }

  async function deleteIdea(id) {
    const updated = (ideas || []).filter(i => i.id !== id)
    await save(updated)
    if (selectedIdea?.id === id) { setSelectedIdea(null); setAiText('') }
  }

  const filtered = (ideas || []).filter(i => filterCat === 'tout' || i.category === filterCat)

  const counts = (ideas || []).reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Idées</h1>
          <div className="page-sub">{ideas?.length || 0} IDÉES CAPTURÉES</div>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-head"><span className="card-title">Capturer une idée</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              placeholder="Titre de l'idée..."
              value={form.title}
              onChange={e => setF('title', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addIdea()}
              style={{ fontSize: 14 }}
            />
            <textarea
              placeholder="Description, contexte, liens, inspirations..."
              value={form.body}
              onChange={e => setF('body', e.target.value)}
              style={{ minHeight: 70 }}
            />
            <div className="form-row" style={{ gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Catégorie</label>
                <select value={form.category} onChange={e => setF('category', e.target.value)}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Statut</label>
                <select value={form.status} onChange={e => setF('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-accent" onClick={addIdea} disabled={loading}>
              {saved ? 'Capturée' : 'Capturer'}
            </button>
          </div>
        </div>

        <div className="grid-2">
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <button
                className={`btn ${filterCat === 'tout' ? 'btn-accent' : 'btn-ghost'}`}
                style={{ fontSize: 11 }}
                onClick={() => setFilterCat('tout')}
              >tout ({ideas?.length || 0})</button>
              {CATS.map(c => (
                <button
                  key={c}
                  className={`btn ${filterCat === c ? 'btn-accent' : 'btn-ghost'}`}
                  style={{ fontSize: 11 }}
                  onClick={() => setFilterCat(c)}
                >{c} ({counts[c] || 0})</button>
              ))}
            </div>
            {filtered.length === 0
              ? <div className="empty-state">Aucune idée dans cette catégorie</div>
              : filtered.map(i => (
                <IdeaCard key={i.id} idea={i} onDevelop={develop} onDelete={deleteIdea} />
              ))
            }
          </div>

          <div>
            <div className="card" style={{ position: 'sticky', top: 0 }}>
              <div className="card-head">
                <span className="card-title">
                  {selectedIdea ? `Développement : ${selectedIdea.title.slice(0, 30)}...` : 'Développement IA'}
                </span>
              </div>
              {aiLoading
                ? <div className="ai-loading"><div className="dot-pulse"><span /><span /><span /></div><span>Développement en cours...</span></div>
                : aiText
                  ? <div className="ai-output">{aiText}</div>
                  : <div className="ai-output" style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      Clique sur "développer" sur une idée pour obtenir 3 pistes concrètes de mise en oeuvre.
                    </div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
