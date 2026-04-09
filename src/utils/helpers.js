export function today() {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function timeAgo(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return "à l'instant"
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`
  return formatDateShort(iso)
}

export function computeScore(entry) {
  if (!entry) return null
  let s = 5
  const [h] = (entry.lever || '08:00').split(':').map(Number)
  if (h <= 7) s += 2
  else if (h <= 8) s += 1
  else s -= 1
  s += Math.round((entry.energie || 5) / 2) - 2
  if (entry.sport && entry.sport !== 'Aucun') s += 1
  if (entry.note && entry.note.length > 20) s += 0.5
  return Math.min(10, Math.max(0, Math.round(s * 10) / 10))
}

export function avg(arr, key) {
  if (!arr?.length) return 0
  const vals = arr.map(i => i[key] || 0).filter(v => v > 0)
  if (!vals.length) return 0
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export function statusColor(status) {
  const map = {
    'en cours': 'badge-teal',
    'bloqué': 'badge-red',
    'à préparer': 'badge-amber',
    'terminé': 'badge-accent',
    'en pause': 'badge-gray',
    'à explorer': 'badge-blue',
    'à faire': 'badge-gray'
  }
  return map[status] || 'badge-gray'
}

export function catColor(cat) {
  const map = {
    tech: 'badge-blue',
    perso: 'badge-teal',
    motorsport: 'badge-amber',
    projet: 'badge-purple'
  }
  return map[cat] || 'badge-gray'
}

export function uid() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
