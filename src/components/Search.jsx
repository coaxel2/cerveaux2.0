import { useState, useEffect, useRef } from 'react'
import { useData } from '../hooks/useData'
import { formatDateShort } from '../utils/helpers'

function highlight(text, q) {
  if (!q || !text) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  return <>{text.slice(0, idx)}<mark style={{ background: 'rgba(200,245,66,0.25)', color: 'var(--accent)', borderRadius: 2 }}>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>
}

export default function Search({ onClose }) {
  const { data: journal } = useData('journal')
  const { data: ideas } = useData('ideas')
  const { data: projects } = useData('projects')
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const query = q.trim().toLowerCase()
  const results = []

  if (query.length >= 2) {
    ;(journal || []).forEach(e => {
      if (e.date?.includes(query) || e.note?.toLowerCase().includes(query) || (e.tags || []).some(t => t.includes(query))) {
        results.push({ type: 'journal', title: formatDateShort(e.date), sub: e.note?.slice(0, 80) || e.tags?.join(', ') || '', raw: e })
      }
    })
    ;(ideas || []).forEach(i => {
      if (i.title?.toLowerCase().includes(query) || i.body?.toLowerCase().includes(query) || i.category?.includes(query)) {
        results.push({ type: 'idée', title: i.title, sub: i.body?.slice(0, 80) || '', raw: i })
      }
    })
    ;(projects || []).forEach(p => {
      if (p.title?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query) || p.nextStep?.toLowerCase().includes(query)) {
        results.push({ type: 'projet', title: p.title, sub: p.description?.slice(0, 80) || p.nextStep || '', raw: p })
      }
    })
  }

  const TYPE_COLOR = { journal: 'var(--accent)', idée: 'var(--purple)', projet: 'var(--teal)' }
  const TYPE_BADGE = { journal: 'badge-accent', idée: 'badge-purple', projet: 'badge-teal' }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, width: '100%', maxWidth: 580, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 16, color: 'var(--text3)' }}>⌕</span>
          <input
            ref={inputRef}
            placeholder="Rechercher dans journal, idées, projets..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ border: 'none', background: 'none', fontSize: 15, flex: 1, outline: 'none', color: 'var(--text)' }}
          />
          {q && <button onClick={() => setQ('')} style={{ color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>}
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {query.length < 2 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              Tape au moins 2 caractères
            </div>
          )}
          {query.length >= 2 && results.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              Aucun résultat pour "{q}"
            </div>
          )}
          {results.map((r, i) => (
            <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className={`badge ${TYPE_BADGE[r.type]}`}>{r.type}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{highlight(r.title, q)}</span>
              </div>
              {r.sub && <div style={{ fontSize: 12, color: 'var(--text3)', paddingLeft: 4 }}>{highlight(r.sub, q)}</div>}
            </div>
          ))}
          {results.length > 0 && (
            <div style={{ padding: '8px 20px', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
