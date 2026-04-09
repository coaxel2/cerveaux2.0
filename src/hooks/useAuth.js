import { useState, useCallback } from 'react'

function getStored() {
  try {
    const token = localStorage.getItem('cerveau2_token')
    const user = localStorage.getItem('cerveau2_user')
    if (token && user) return { token, user: JSON.parse(user) }
  } catch {}
  return null
}

export function useAuth() {
  const [auth, setAuth] = useState(getStored)

  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem('cerveau2_token', data.token)
    localStorage.setItem('cerveau2_user', JSON.stringify(data.user))
    setAuth({ token: data.token, user: data.user })
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem('cerveau2_token', data.token)
    localStorage.setItem('cerveau2_user', JSON.stringify(data.user))
    setAuth({ token: data.token, user: data.user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cerveau2_token')
    localStorage.removeItem('cerveau2_user')
    setAuth(null)
  }, [])

  return { auth, login, register, logout }
}
