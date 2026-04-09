import { useState, useEffect, useCallback } from 'react'

const BASE = '/api'

export function useData(file) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/${file}`)
      if (!res.ok) throw new Error('Fichier introuvable')
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
    try {
      await fetch(`${BASE}/${file}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })
      setData(newData)
    } catch (e) {
      console.error('Erreur sauvegarde:', e)
    }
  }, [file])

  const append = useCallback(async (item) => {
    try {
      await fetch(`${BASE}/${file}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      setData(prev => Array.isArray(prev) ? [...prev, item] : { ...prev, ...item })
    } catch (e) {
      console.error('Erreur append:', e)
    }
  }, [file])

  return { data, loading, error, save, append, reload: load }
}
