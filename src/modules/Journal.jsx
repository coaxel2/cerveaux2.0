import { useState } from 'react'
import { useData } from '../hooks/useData'
import { useAI } from '../hooks/useAI'
import { today, formatDate, computeScore } from '../utils/helpers'

const SPORTS = ['Aucun', 'Course', 'Muscu', 'Vélo', 'Natation', 'Yoga', 'Marche', 'Autre']

function JournalEntry({ entry }) {
  const score = entry.score ?? computeScore(entry)
  const color = score >= 7 ? 'var(--accent)' : score >= 5 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="card card-sm" style={{ marginBottom: 10 }}>
      <div className="card-head" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{formatDate(entry.date)}</span>
        {score !== null && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color }}>{score.toFixed(1)}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: entry.note ? 10 : 0 }}>
        {entry.lever && <span style={{ fontSize: 12, color: 'var(--text2)' }}>Lever <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{entry.lever}</span></span>}
        {entry.coucher && <span style={{ fontSize: 12, color: 'var(--text2)' }}>Coucher <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{entry.coucher}</span></span>}
        {entry.sport && entry.sport !== 'Aucun' && <span style={{ fontSize: 12, color: 'var(--teal)' }}>{entry.sport}</span>}
        {entry.energie && <span style={{ fontSize: 12, color: 'var(--text2)' }}>Énergie <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{entry.energie}/10</span></span>}
      </div>
      {entry.note && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{entry.note}</p>}
    </div>
  )
}

export default function Journal() {
  const { data: journal, save, loading: dataLoading } = useData('journal')
  const { data: context } = useData('context')
  const { ask, loading: aiLoading } = useAI()

  const todayStr = today()
  const existing = journal?.find(e => e.date === todayStr)

  const [form, setForm] = useState({
    lever: existing?.lever || '',
    coucher: existing?.coucher || '',
    sport: existing?.sport || 'Aucun',
    energie: existing?.energie ?? 7,
    note: existing?.note || ''
  })
  const [saved, setSaved] = useState(false)
  const [aiText, setAiText] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function saveEntry() {
    if (!journal) return
    const entry = {
      id: todayStr,
      date: todayStr,
      ...form,
      score: computeScore({ ...form })
    }
    const updated = journal.filter(e => e.date !== todayStr)
    updated.push(entry)
    updated.sort((a, b) => a.date.localeCompare(b.date))
    await save(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function generateSummary() {
    const last = journal?.slice(-7) || []
    const summary = last.map(e =>
      `${e.date} : lever ${e.lever}, énergie ${e.energie}/10, sport ${e.sport}, note "${e.note || 'aucune'}"`
    ).join('\n')
    const result = await ask(
      'Génère un résumé narratif de ma semaine en 4-5 phrases, puis 2 ajustements de rythme prioritaires.',
      context,
      `Journal des 7 derniers jours :\n${summary}`
    )
    if (result) setAiText(result)
  }

  const history = journal ? [...journal].sort((a, b) => b.date.localeCompare(a.date)).slice(1, 10) : []

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
                  <input type="range" min="1" max="10" step="1"
                    value={form.energie}
                    onChange={e => set('energie', parseInt(e.target.value))}
                  />
                  <span className="range-val">{form.energie}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Note libre</label>
                <textarea
                  placeholder="Ce qui s'est passé, ce que tu ressens..."
                  value={form.note}
                  onChange={e => set('note', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn btn-accent" onClick={saveEntry} disabled={dataLoading}>
                  {saved ? 'Enregistré' : 'Sauvegarder'}
                </button>
                <button className="btn btn-ghost" onClick={generateSummary} disabled={aiLoading}>
                  {aiLoading ? 'Résumé...' : 'Résumé IA'}
                </button>
              </div>
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

        {aiText && (
          <div className="card">
            <div className="card-head"><span className="card-title">Résumé IA de la semaine</span></div>
            <div className="ai-output">{aiText}</div>
          </div>
        )}

        <div className="card">
          <div className="card-head">
            <span className="card-title">Historique récent</span>
            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setShowHistory(v => !v)}>
              {showHistory ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {showHistory && (
            history.length === 0
              ? <div className="empty-state">Aucune entrée précédente</div>
              : history.map(e => <JournalEntry key={e.id} entry={e} />)
          )}
          {!showHistory && (
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              {history.length} entrée{history.length > 1 ? 's' : ''} disponible{history.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
