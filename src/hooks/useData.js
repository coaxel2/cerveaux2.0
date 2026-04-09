import { useState, useEffect, useCallback } from 'react'
import defaultContext from '../../data/context.json'

const DEFAULTS = { context: defaultContext }

export function useData(file) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/${file}`)
      if (!res.ok) throw new Error('Erreur chargement')
      const json = await res.json()
      setData(Array.isArray(json) ? json : (Object.keys(json).length ? json : (DEFAULTS[file] ?? json)))
    } catch (e) {
      setError(e.message)
      setData(DEFAULTS[file] ?? null)
    } finally {
      setLoading(false)
    }
  }, [file])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (newData) => {
    await fetch(`/api/${file}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    })
    setData(newData)
  }, [file])

  const append = useCallback(async (item) => {
    await fetch(`/api/${file}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    setData(prev => Array.isArray(prev) ? [...prev, item] : { ...prev, ...item })
  }, [file])

  return { data, loading, error, save, append, reload: load }
}
