import { useState } from 'react'
import { useData } from '../hooks/useData'
import { today, formatDate, computeScore } from '../utils/helpers'

const SPORTS = ['Aucun', 'Course', 'Muscu', 'Vélo', 'Natation', 'Yoga', 'Marche', 'Autre']
const TAGS_LIST = ['productif', 'social', 'créatif', 'stressant', 'reposant', 'intensif', 'focus', 'relax']
const TAG_COLORS = { productif: 'badge-accent', social: 'badge-teal', créatif: 'badge-purple', stressant: 'badge-red', reposant: 'badge-blue', intensif: 'badge-amber', focus: 'badge-accent', relax: 'badge-gray' }

function JournalEntry({ entry }) {
  const score = entry.score ?? computeScore(entry)
  const color = score >= 7 ? 'var(--accent)' : score >= 5 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="card card-sm" style={{ marginBottom: 10 }}>
      <div className="card-head" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(entry.date)}</span>
        {score !== null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color }}>{score.toFixed(1)}</span>}
      </div>
      {entry.photo && (
        <img src={entry.photo} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} onError={e => e.target.style.display='none'} />
      )}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: (entry.note || entry.tags?.length) ? 10 : 0 }}>
        {entry.lever && <span style={{ fontSize: 12, color: 'var(--text2)' }}>Lever <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{entry.lever}</span></span>}
        {entry.coucher && <span style={{ fontSize: 12, color: 'var(--text2)' }}>Coucher <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{entry.coucher}</span></span>}
        {entry.sport && entry.sport !== 'Aucun' && <span style={{ fontSize: 12, color: 'var(--teal)' }}>{entry.sport}</span>}
        {entry.energie && <span style={{ fontSize: 12, color: 'var(--text2)' }}>Énergie <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{entry.energie}/10</span></span>}
      </div>
      {entry.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: entry.note ? 8 : 0 }}>
          {entry.tags.map(t => <span key={t} className={`badge ${TAG_COLORS[t] || 'badge-gray'}`}>{t}</span>)}
        </div>
      )}
      {entry.note && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{entry.note}</p>}
    </div>
  )
}

export default function Journal() {
  const { data: journal, save } = useData('journal')
  const { data: context } = useData('context')

  const todayStr = today()
  const existing = journal?.find(e => e.date === todayStr)

  const [form, setForm] = useState({
    lever: existing?.lever || '',
    coucher: existing?.coucher || '',
    sport: existing?.sport || 'Aucun',
    energie: existing?.energie ?? 7,
    note: existing?.note || '',
    tags: existing?.tags || [],
    photo: existing?.photo || ''
  })
  const [saved, setSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [filterTag, setFilterTag] = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function toggleTag(t) { setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] })) }

  function saveEntry() {
    if (!journal) return
    const entry = { id: todayStr, date: todayStr, ...form, score: computeScore({ ...form }) }
    const updated = journal.filter(e => e.date !== todayStr)
    updated.push(entry)
    updated.sort((a, b) => a.date.localeCompare(b.date))
    save(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const history = journal ? [...journal].sort((a, b) => b.date.localeCompare(a.date)).slice(1) : []
  const filteredHistory = filterTag ? history.filter(e => e.tags?.includes(filterTag)) : history
  const usedTags = [...new Set(history.flatMap(e => e.tags || []))]

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Journée</h1>
          <div className="page-sub">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</div>
        </div>
        {existing && <span className="badge badge-accent">check-in enregistré</span>}
      </div>

      <div className="page-content">
        <div className="grid-2">
          <div className="card">
            <div className="card-head"><span className="card-title">Check-in du jour</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-row" style={{ gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Heure de lever</label>
                  <input type="time" value={form.lever} onChange={e => set('lever', e.target.value)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Heure de coucher</label>
                  <input type="time" value={form.coucher} onChange={e => set('coucher', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sport</label>
                <select value={form.sport} onChange={e => set('sport', e.target.value)}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Énergie ressentie</label>
                <div className="range-wrap">
                  <input type="range" min="1" max="10" step="1" value={form.energie} onChange={e => set('energie', parseInt(e.target.value))} />
                  <span className="range-val">{form.energie}</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {TAGS_LIST.map(t => (
                    <button key={t} onClick={() => toggleTag(t)}
                      className={`badge ${form.tags.includes(t) ? (TAG_COLORS[t] || 'badge-gray') : 'badge-gray'}`}
                      style={{ cursor: 'pointer', opacity: form.tags.includes(t) ? 1 : 0.5, border: 'none' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Photo du jour (URL)</label>
                <input type="url" placeholder="https://..." value={form.photo} onChange={e => set('photo', e.target.value)} />
                {form.photo && <img src={form.photo} alt="" style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.style.display='none'} />}
              </div>
              <div className="form-group">
                <label className="form-label">Note libre</label>
                <textarea placeholder="Ce qui s'est passé, ce que tu ressens..." value={form.note} onChange={e => set('note', e.target.value)} />
              </div>
              <button className="btn btn-accent" onClick={saveEntry}>{saved ? 'Enregistré ✓' : 'Sauvegarder'}</button>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <span className="card-title">Agenda type</span>
              <span className="badge badge-gray">personnalisable</span>
            </div>
            {[
              { h: '07:00', label: 'Lever + routine matinale', type: 'routine', color: 'var(--teal)' },
              { h: '08:30', label: 'Bloc de travail profond', type: 'focus', color: 'var(--purple)' },
              { h: '12:00', label: 'Pause déjeuner', type: 'repos', color: 'var(--text3)' },
              { h: '13:30', label: 'Tâches légères / admin', type: 'admin', color: 'var(--amber)' },
              { h: '17:00', label: 'Sport ou marche', type: 'corps', color: 'var(--teal)' },
              { h: '20:00', label: 'Temps libre / lecture', type: 'perso', color: 'var(--blue)' },
              { h: '22:30', label: 'Déconnexion écrans', type: 'routine', color: 'var(--text3)' },
            ].map(({ h, label, type, color }) => (
              <div className="row" key={h} style={{ alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', width: 48, flexShrink: 0 }}>{h}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color, flexShrink: 0 }}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historique */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Historique ({history.length})</span>
            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setShowHistory(v => !v)}>
              {showHistory ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {showHistory && (
            <>
              {usedTags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  <button className={`badge ${!filterTag ? 'badge-accent' : 'badge-gray'}`} style={{ cursor: 'pointer', border: 'none' }} onClick={() => setFilterTag(null)}>tous</button>
                  {usedTags.map(t => (
                    <button key={t} className={`badge ${filterTag === t ? (TAG_COLORS[t] || 'badge-gray') : 'badge-gray'}`}
                      style={{ cursor: 'pointer', border: 'none', opacity: filterTag === t ? 1 : 0.6 }}
                      onClick={() => setFilterTag(filterTag === t ? null : t)}>{t}</button>
                  ))}
                </div>
              )}
              {filteredHistory.length === 0
                ? <div className="empty-state">Aucune entrée</div>
                : filteredHistory.slice(0, 20).map(e => <JournalEntry key={e.id} entry={e} />)
              }
            </>
          )}
          {!showHistory && (
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              {history.length} entrée{history.length > 1 ? 's' : ''} — clique pour afficher
            </div>
          )}
        </div>
      </div>
    </>
  )
}
