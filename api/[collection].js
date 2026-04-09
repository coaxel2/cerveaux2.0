import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
let cachedClient = null

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }
  return cachedClient.db('cerveau2')
}

const ALLOWED = ['journal', 'ideas', 'projects', 'context']

export default async function handler(req, res) {
  const { collection } = req.query

  if (!ALLOWED.includes(collection)) {
    return res.status(400).json({ error: 'invalid collection' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = await getDb()
    const col = db.collection(collection)

    if (req.method === 'GET') {
      const docs = await col.find({}).toArray()
      const clean = docs.map(({ _id, ...d }) => d)
      if (collection === 'context') return res.json(clean[0] || {})
      return res.json(clean)
    }

    if (req.method === 'POST') {
      await col.deleteMany({})
      const data = req.body
      if (Array.isArray(data)) {
        if (data.length > 0) await col.insertMany(data)
      } else if (data && Object.keys(data).length > 0) {
        await col.insertOne(data)
      }
      return res.json({ ok: true })
    }

    if (req.method === 'PATCH') {
      await col.insertOne(req.body)
      return res.json({ ok: true })
    }

    res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
