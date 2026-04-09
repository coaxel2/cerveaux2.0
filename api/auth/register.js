import bcrypt from 'bcryptjs'
import { getDb } from '../_db.js'
import { createToken } from '../_auth.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })
  if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (6 caractères min)' })

  try {
    const db = await getDb()
    const existing = await db.collection('users').findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' })

    const hashed = await bcrypt.hash(password, 10)
    const user = {
      id: crypto.randomUUID(),
      name: name?.trim() || email.split('@')[0],
      email,
      password: hashed,
      createdAt: new Date().toISOString()
    }
    await db.collection('users').insertOne(user)

    const token = createToken({ userId: user.id, email: user.email, name: user.name })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
