import { useState, useCallback } from 'react'
import defaultContext from '../../data/context.json'

const DEFAULTS = {
  journal: [],
  ideas: [],
  projects: [],
  context: defaultContext,
}

export function useData(file) {
  const key = `cerveau2_${file}`

  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) return JSON.parse(stored)
    } catch {}
    return DEFAULTS[file] ?? null
  })

  const save = useCallback((newData) => {
    localStorage.setItem(key, JSON.stringify(newData))
    setData(newData)
  }, [key])

  const append = useCallback((item) => {
    setData(prev => {
      const updated = Array.isArray(prev) ? [...prev, item] : { ...prev, ...item }
      localStorage.setItem(key, JSON.stringify(updated))
      return updated
    })
  }, [key])

  return { data, loading: false, error: null, save, append, reload: () => {} }
}
