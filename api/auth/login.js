import bcrypt from 'bcryptjs'
import { getDb } from '../_db.js'
import { createToken } from '../_auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })

  try {
    const db = await getDb()
    const user = await db.collection('users').findOne({ email })
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' })

    const token = createToken({ userId: user.id, email: user.email, name: user.name })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
