import { useData } from '../hooks/useData'
import { avg, computeScore, formatDateShort, today } from '../utils/helpers'

function MetricCard({ label, value, sub, color }) {
  return (
    <div className="card card-sm">
      <div className="card-title" style={{ marginBottom: 10 }}>{label}</div>
      <div className="metric-val" style={color ? { color } : {}}>{value ?? '—'}</div>
      {sub && <div className="metric-label">{sub}</div>}
    </div>
  )
}

function WeekBar({ entry }) {
  const score = entry.score ?? computeScore(entry)
  const pct = score ? Math.round((score / 10) * 100) : 0
  const color = score >= 7 ? 'var(--accent)' : score >= 5 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="row">
      <span className="row-label" style={{ width: 80 }}>{formatDateShort(entry.date)}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="row-val" style={{ color }}>{score?.toFixed(1) ?? '—'}</span>
    </div>
  )
}

export default function Dashboard() {
  const { data: journal } = useData('journal')
  const { data: ideas } = useData('ideas')
  const { data: projects } = useData('projects')
  const { data: context } = useData('context')

  const todayEntry = journal?.find(e => e.date === today())
  const last7 = journal?.slice(-7) || []
  const avgScore = avg(last7.map(e => ({ score: e.score ?? computeScore(e) })), 'score')
  const activeProjects = projects?.filter(p => p.status !== 'terminé')?.length || 0
  const blockedProjects = projects?.filter(p => p.status === 'bloqué')?.length || 0
  const thisMonth = ideas?.filter(i => i.createdAt?.startsWith(new Date().toISOString().slice(0, 7)))?.length || 0

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vue d'ensemble</h1>
          <div className="page-sub">AUJOURD'HUI · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</div>
        </div>
        <span className={`badge ${todayEntry ? 'badge-accent' : 'badge-gray'}`}>
          {todayEntry ? 'check-in fait' : 'pas de check-in'}
        </span>
      </div>

      <div className="page-content">
        <div className="grid-4">
          <MetricCard label="Lever aujourd'hui" value={todayEntry?.lever || '—'} sub={todayEntry ? `cible ${context?.preferences?.wakeTarget || '07:00'}` : 'pas de données'} color="var(--accent)" />
          <MetricCard label="Score moyen 7j" value={avgScore || '—'} sub="sur 10" />
          <MetricCard label="Idées ce mois" value={thisMonth} sub={`${ideas?.length || 0} total`} color="var(--purple)" />
          <MetricCard label="Projets actifs" value={activeProjects} sub={blockedProjects > 0 ? `${blockedProjects} bloqué${blockedProjects > 1 ? 's' : ''}` : 'aucun bloqué'} color={blockedProjects > 0 ? 'var(--red)' : 'var(--teal)'} />
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-head">
              <span className="card-title">Rythme des 7 derniers jours</span>
            </div>
            {last7.length === 0
              ? <div className="empty-state">Aucune donnée</div>
              : last7.map(e => <WeekBar key={e.id} entry={e} />)
            }
          </div>

          <div className="card">
            <div className="card-head">
              <span className="card-title">Projets en cours</span>
            </div>
            {projects?.filter(p => p.status !== 'terminé').map(p => (
              <div className="row" key={p.id} style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{p.title}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{
                      width: `${p.progress}%`,
                      background: p.status === 'bloqué' ? 'var(--red)' : p.status === 'à préparer' ? 'var(--amber)' : 'var(--teal)'
                    }} />
                  </div>
                </div>
                <span className="row-val">{p.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
