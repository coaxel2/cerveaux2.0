import { getDb } from './_db.js'
import { verifyToken } from './_auth.js'

const ALLOWED = ['journal', 'ideas', 'projects', 'context', 'tasks', 'habits']

export default async function handler(req, res) {
  const { collection } = req.query

  if (!ALLOWED.includes(collection)) return res.status(400).json({ error: 'invalid collection' })

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  let userId
  try {
    const decoded = verifyToken(req)
    userId = decoded.userId
  } catch {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  try {
    const db = await getDb()
    const col = db.collection(collection)

    if (req.method === 'GET') {
      const docs = await col.find({ userId }).toArray()
      const clean = docs.map(({ _id, userId: _, ...d }) => d)
      if (collection === 'context') return res.json(clean[0] || {})
      return res.json(clean)
    }

    if (req.method === 'POST') {
      await col.deleteMany({ userId })
      const data = req.body
      if (Array.isArray(data)) {
        if (data.length > 0) await col.insertMany(data.map(d => ({ ...d, userId })))
      } else if (data && Object.keys(data).length > 0) {
        await col.insertOne({ ...data, userId })
      }
      return res.json({ ok: true })
    }

    if (req.method === 'PATCH') {
      await col.insertOne({ ...req.body, userId })
      return res.json({ ok: true })
    }

    res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
