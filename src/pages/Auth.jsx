import { useState } from 'react'

export default function Auth({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await onLogin(form.email, form.password)
      } else {
        await onRegister(form.name, form.email, form.password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 6 }}>Cerveau 2.0</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {mode === 'login' ? 'CONNEXION' : 'CRÉER UN COMPTE'}
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input
                type="text"
                placeholder="Axel"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                autoComplete="name"
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="axel@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              placeholder={mode === 'register' ? '6 caractères minimum' : '••••••••'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)', padding: '8px 12px', background: 'rgba(255,90,90,0.1)', borderRadius: 6, border: '1px solid rgba(255,90,90,0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-accent" disabled={loading} style={{ marginTop: 4, padding: '12px' }}>
            {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text3)' }}>
          {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
          {' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontFamily: 'var(--font-sans)' }}
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  )
}
