import { useData } from '../hooks/useData'
import { computeScore, last30Days, formatDateShort } from '../utils/helpers'

function LineChart({ points, color = 'var(--accent)', height = 80 }) {
  if (!points || points.length < 2) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>Pas assez de données</div>
  const vals = points.map(p => p.y).filter(v => v != null)
  if (!vals.length) return null
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const W = 100
  const H = height
  const step = W / (points.length - 1)

  const pts = points.map((p, i) => {
    if (p.y == null) return null
    return { x: i * step, y: H - 8 - ((p.y - min) / range) * (H - 16), label: p.label, val: p.y }
  })

  const valid = pts.filter(Boolean)
  const pathD = valid.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace(/[^a-z]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {valid.length > 1 && (
        <path d={`${pathD} L${valid[valid.length-1].x} ${H} L${valid[0].x} ${H} Z`}
          fill={`url(#grad-${color.replace(/[^a-z]/gi,'')})`} />
      )}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {valid.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

function MiniBarChart({ data, color = 'var(--teal)', height = 60 }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.value))
  return (
    <div style={{ display: 'flex', align: 'flex-end', gap: 4, height, alignItems: 'flex-end' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', height: max ? `${(d.value / max) * (height - 20)}px` : 0, minHeight: d.value ? 4 : 0 }} />
          <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--font-mono)', textAlign: 'center', lineHeight: 1 }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Stats() {
  const { data: journal } = useData('journal')
  const { data: tasks } = useData('tasks')
  const { data: habits } = useData('habits')

  const days = last30Days()
  const journalMap = Object.fromEntries((journal || []).map(e => [e.date, e]))

  // Score + energy trend
  const scorePts = days.map(d => ({ label: formatDateShort(d), y: journalMap[d] ? (journalMap[d].score ?? computeScore(journalMap[d])) : null }))
  const energyPts = days.map(d => ({ label: formatDateShort(d), y: journalMap[d]?.energie ?? null }))

  // Lever trend (convert HH:MM to decimal for chart)
  const leverPts = days.map(d => {
    const e = journalMap[d]
    if (!e?.lever) return { label: formatDateShort(d), y: null }
    const [h, m] = e.lever.split(':').map(Number)
    return { label: formatDateShort(d), y: h + m / 60 }
  })

  // Sport frequency
  const sportCount = {}
  ;(journal || []).forEach(e => { if (e.sport && e.sport !== 'Aucun') sportCount[e.sport] = (sportCount[e.sport] || 0) + 1 })
  const sportData = Object.entries(sportCount).sort((a,b) => b[1]-a[1]).map(([label, value]) => ({ label, value }))

  // Correlations
  const withSport = (journal || []).filter(e => e.sport && e.sport !== 'Aucun')
  const withoutSport = (journal || []).filter(e => !e.sport || e.sport === 'Aucun')
  const avgE = arr => arr.length ? Math.round(arr.reduce((s, e) => s + (e.energie || 0), 0) / arr.length * 10) / 10 : null
  const avgS = arr => arr.length ? Math.round(arr.reduce((s, e) => s + (e.score ?? computeScore(e) ?? 0), 0) / arr.length * 10) / 10 : null

  // Tasks stats
  const completedTasks = (tasks || []).filter(t => t.done).length
  const totalTasks = (tasks || []).length
  const taskRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Habits consistency
  const habitStats = (habits || []).map(h => {
    const last30 = (h.completions || []).filter(d => days.includes(d)).length
    return { name: h.name, emoji: h.emoji, rate: Math.round((last30 / 30) * 100), count: last30 }
  }).sort((a,b) => b.rate - a.rate)

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Statistiques</h1>
          <div className="page-sub">30 DERNIERS JOURS</div>
        </div>
      </div>

      <div className="page-content">
        {/* Summary metrics */}
        <div className="grid-4">
          <div className="card card-sm">
            <div className="card-title" style={{ marginBottom: 10 }}>Entrées journal</div>
            <div className="metric-val">{(journal || []).length}</div>
            <div className="metric-label">{days.filter(d => journalMap[d]).length} ce mois</div>
          </div>
          <div className="card card-sm">
            <div className="card-title" style={{ marginBottom: 10 }}>Taux tâches</div>
            <div className="metric-val" style={{ color: taskRate >= 70 ? 'var(--accent)' : 'var(--amber)' }}>{taskRate}%</div>
            <div className="metric-label">{completedTasks}/{totalTasks} complétées</div>
          </div>
          <div className="card card-sm">
            <div className="card-title" style={{ marginBottom: 10 }}>Jours sport</div>
            <div className="metric-val" style={{ color: 'var(--teal)' }}>{withSport.length}</div>
            <div className="metric-label">sur {(journal || []).length} entrées</div>
          </div>
          <div className="card card-sm">
            <div className="card-title" style={{ marginBottom: 10 }}>Habitudes actives</div>
            <div className="metric-val" style={{ color: 'var(--purple)' }}>{(habits || []).length}</div>
            <div className="metric-label">{habitStats.filter(h => h.rate >= 50).length} régulières</div>
          </div>
        </div>

        {/* Score trend */}
        <div className="grid-2">
          <div className="card">
            <div className="card-head"><span className="card-title">Score journalier</span><span className="badge badge-accent">30j</span></div>
            <LineChart points={scorePts} color="var(--accent)" height={100} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                {days[0].slice(5)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                {days[29].slice(5)}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><span className="card-title">Énergie</span><span className="badge badge-purple">30j</span></div>
            <LineChart points={energyPts} color="var(--purple)" height={100} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{days[0].slice(5)}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{days[29].slice(5)}</span>
            </div>
          </div>
        </div>

        {/* Lever trend + sport */}
        <div className="grid-2">
          <div className="card">
            <div className="card-head"><span className="card-title">Heure de lever</span><span className="badge badge-teal">30j</span></div>
            <LineChart points={leverPts} color="var(--teal)" height={100} />
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 8, textAlign: 'center' }}>
              Axe inversé — plus bas = plus tôt
            </div>
          </div>

          <div className="card">
            <div className="card-head"><span className="card-title">Sport par type</span></div>
            {sportData.length === 0
              ? <div className="empty-state" style={{ padding: '20px 0' }}>Aucune donnée sport</div>
              : <MiniBarChart data={sportData} color="var(--teal)" height={100} />
            }
          </div>
        </div>

        {/* Correlations */}
        <div className="card">
          <div className="card-head"><span className="card-title">Corrélations</span><span className="badge badge-amber">insights</span></div>
          <div className="grid-2" style={{ gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>SPORT VS ÉNERGIE</div>
              <div className="row">
                <span className="row-label">Jours avec sport</span>
                <span className="row-val" style={{ color: 'var(--teal)' }}>{avgE(withSport) ?? '—'}/10</span>
              </div>
              <div className="row">
                <span className="row-label">Jours sans sport</span>
                <span className="row-val" style={{ color: 'var(--text3)' }}>{avgE(withoutSport) ?? '—'}/10</span>
              </div>
              {avgE(withSport) && avgE(withoutSport) && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  → {avgE(withSport) > avgE(withoutSport) ? `+${Math.round((avgE(withSport) - avgE(withoutSport)) * 10) / 10}` : Math.round((avgE(withSport) - avgE(withoutSport)) * 10) / 10} énergie avec sport
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>SPORT VS SCORE</div>
              <div className="row">
                <span className="row-label">Jours avec sport</span>
                <span className="row-val" style={{ color: 'var(--teal)' }}>{avgS(withSport) ?? '—'}/10</span>
              </div>
              <div className="row">
                <span className="row-label">Jours sans sport</span>
                <span className="row-val" style={{ color: 'var(--text3)' }}>{avgS(withoutSport) ?? '—'}/10</span>
              </div>
              {avgS(withSport) && avgS(withoutSport) && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  → {avgS(withSport) > avgS(withoutSport) ? `+${Math.round((avgS(withSport) - avgS(withoutSport)) * 10) / 10}` : Math.round((avgS(withSport) - avgS(withoutSport)) * 10) / 10} score avec sport
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Habits consistency */}
        {habitStats.length > 0 && (
          <div className="card">
            <div className="card-head"><span className="card-title">Régularité des habitudes</span><span className="badge badge-gray">30j</span></div>
            {habitStats.map(h => (
              <div key={h.name} className="row" style={{ alignItems: 'center' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{h.emoji}</span>
                <span className="row-label" style={{ flex: 1 }}>{h.name}</span>
                <div className="bar-track" style={{ flex: 2 }}>
                  <div className="bar-fill" style={{ width: `${h.rate}%`, background: h.rate >= 70 ? 'var(--accent)' : h.rate >= 40 ? 'var(--amber)' : 'var(--red)' }} />
                </div>
                <span className="row-val" style={{ minWidth: 40, textAlign: 'right' }}>{h.rate}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
