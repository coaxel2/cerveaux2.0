import { useState } from 'react'

const SYSTEM = (ctx) => `Tu es l'assistant personnel d'Axel. Tu as accès à son cerveau numérique.

Profil : ${ctx?.name || 'Axel'}, ${ctx?.role || 'Chef de Projet Digital'} en alternance chez ${ctx?.alternance || 'Orange'}, basé à ${ctx?.location || 'Bordeaux'}.
Outils : ${ctx?.tools?.join(', ') || 'N8N, Notion, Claude Code'}.
Centres d'intérêt : ${ctx?.interests?.join(', ') || 'automatisation, IA, motorsport'}.
Cible lever : ${ctx?.preferences?.wakeTarget || '07:00'} | Cible coucher : ${ctx?.preferences?.sleepTarget || '23:00'}.

Réponds toujours en français. Sois concis, direct et actionnable. Pas de tiret cadratin. Pas de fioriture. Adapte-toi au contexte de la question.`

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ask = async (prompt, context = null, extraContext = '') => {
    setLoading(true)
    setError(null)
    try {
      const userContent = extraContext
        ? `Contexte additionnel :\n${extraContext}\n\nQuestion : ${prompt}`
        : prompt

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM(context),
          messages: [{ role: 'user', content: userContent }]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      return data.content?.[0]?.text || ''
    } catch (e) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { ask, loading, error }
}
