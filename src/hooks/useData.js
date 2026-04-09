import { useState, useEffect, useCallback } from 'react'

function getToken() {
  return localStorage.getItem('cerveau2_token')
}

export function useData(file) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/${file}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (!res.ok) throw new Error('Erreur chargement')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [file])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (newData) => {
    await fetch(`/api/${file}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(newData)
    })
    setData(newData)
  }, [file])

  const append = useCallback(async (item) => {
    await fetch(`/api/${file}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(item)
    })
    setData(prev => Array.isArray(prev) ? [...prev, item] : { ...prev, ...item })
  }, [file])

  return { data, loading, error, save, append, reload: load }
}
