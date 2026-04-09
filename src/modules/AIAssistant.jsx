import { useState, useRef } from 'react'
import { useData } from '../hooks/useData'
import { useAI } from '../hooks/useAI'
import { computeScore } from '../utils/helpers'

const QUICK_PROMPTS = [
  { label: 'Analyse ma semaine', prompt: 'Analyse mon rythme de la semaine dernière et donne-moi 3 recommandations précises.' },
  { label: 'Plan demain', prompt: 'Crée-moi un plan de journée optimisé pour demain en tenant compte de mes habitudes.' },
  { label: 'Débloquer un projet', prompt: 'Quel projet bloqué devrais-je prioriser et comment le relancer concrètement ?' },
  { label: 'Idées prometteuses', prompt: 'Quelles sont les 2-3 idées les plus prometteuses de ma liste qui méritent d\'être développées en projets ?' },
  { label: 'Bilan mensuel', prompt: 'Fais-moi un bilan de ce mois : points forts, points faibles, tendances à surveiller.' },
  { label: 'Routine optimale', prompt: 'Propose-moi une routine matinale optimisée basée sur mon profil et mes objectifs.' },
]

function Message({ msg }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
      gap: 10,
      marginBottom: 16,
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: msg.role === 'user' ? 'rgba(200,245,66,0.15)' : 'rgba(157,127,245,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontFamily: 'var(--font-mono)',
        color: msg.role === 'user' ? 'var(--accent)' : 'var(--purple)'
      }}>
        {msg.role === 'user' ? 'A' : 'AI'}
      </div>
      <div style={{
        maxWidth: '78%',
        background: msg.role === 'user' ? 'var(--bg3)' : 'var(--bg2)',
        border: `1px solid ${msg.role === 'user' ? 'var(--border2)' : 'rgba(157,127,245,0.2)'}`,
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        lineHeight: 1.7,
        color: 'var(--text)',
        whiteSpace: 'pre-wrap'
      }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function AIAssistant() {
  const { data: journal } = useData('journal')
  const { data: ideas } = useData('ideas')
  const { data: projects } = useData('projects')
  const { data: context } = useData('context')
  const { ask, loading } = useAI()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  function buildExtraContext() {
    const last7 = (journal || []).slice(-7).map(e =>
      `${e.date}: lever ${e.lever}, énergie ${e.energie}/10, sport ${e.sport}, score ${(e.score ?? computeScore(e))?.toFixed(1)}`
    ).join('\n')

    const ideaSummary = (ideas || []).slice(0, 10).map(i =>
      `[${i.category}] ${i.title} (${i.status})`
    ).join('\n')

    const projectSummary = (projects || []).map(p =>
      `${p.title} — ${p.status} — ${p.progress}% — prochaine étape: ${p.nextStep || 'non définie'}`
    ).join('\n')

    return `Journal (7 derniers jours):\n${last7}\n\nIdées (10 dernières):\n${ideaSummary}\n\nProjets:\n${projectSummary}`
  }

  async function send(textOverride) {
    const text = (textOverride || input).trim()
    if (!text) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

    const extra = buildExtraContext()
    const result = await ask(text, context, extra)

    if (result) {
      setMessages(prev => [...prev, { role: 'assistant', content: result }])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  function clearHistory() { setMessages([]) }

  const hasData = journal?.length > 0 || ideas?.length > 0 || projects?.length > 0

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assistant IA</h1>
          <div className="page-sub">CONTEXTE PERSONNEL CHARGÉ · {(journal?.length || 0)} ENTRÉES JOURNAL · {(ideas?.length || 0)} IDÉES · {(projects?.length || 0)} PROJETS</div>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={clearHistory}>Effacer</button>
        )}
      </div>

      <div className="page-content">
        {!hasData && (
          <div className="card" style={{ borderLeft: '2px solid var(--amber)' }}>
            <div style={{ fontSize: 13, color: 'var(--amber)' }}>
              Lance d'abord le serveur local (<code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4 }}>npm run dev</code>) pour que l'IA accède à tes données.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              className="btn btn-ghost"
              style={{ fontSize: 11 }}
              onClick={() => send(qp.prompt)}
              disabled={loading}
            >
              {qp.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ minHeight: 300 }}>
          {messages.length === 0 && (
            <div className="empty-state" style={{ paddingTop: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 12, fontFamily: 'var(--font-display)', color: 'var(--text3)' }}>Cerveau 2.0</div>
              <div>Ton assistant connaît ton journal, tes idées et tes projets.</div>
              <div style={{ marginTop: 4 }}>Utilise les raccourcis ci-dessus ou pose une question libre.</div>
            </div>
          )}

          {messages.map((m, i) => <Message key={i} msg={m} />)}

          {loading && (
            <div className="ai-loading" style={{ padding: '8px 0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(157,127,245,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--purple)' }}>AI</div>
              <div className="dot-pulse"><span /><span /><span /></div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Pose une question à ton cerveau..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            style={{ flex: 1, fontSize: 14 }}
            disabled={loading}
          />
          <button className="btn btn-accent" onClick={() => send()} disabled={loading || !input.trim()}>
            Envoyer
          </button>
        </div>

        <div className="card card-sm">
          <div className="card-head" style={{ marginBottom: 10 }}>
            <span className="card-title">Contexte chargé</span>
            <span className="badge badge-teal">data/</span>
          </div>
          <div className="row"><span className="row-label">journal.json</span><span className="row-val">{journal?.length || 0} entrées</span></div>
          <div className="row"><span className="row-label">ideas.json</span><span className="row-val">{ideas?.length || 0} idées</span></div>
          <div className="row"><span className="row-label">projects.json</span><span className="row-val">{projects?.length || 0} projets</span></div>
          <div className="row"><span className="row-label">context.json</span><span className="row-val" style={{ color: 'var(--teal)' }}>{context ? 'chargé' : 'introuvable'}</span></div>
        </div>
      </div>
    </>
  )
}
