import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const DATA_DIR = path.join(__dirname, 'data')

app.use(cors())
app.use(express.json())

function readJSON(file) {
  const fp = path.join(DATA_DIR, file)
  if (!fs.existsSync(fp)) return null
  return JSON.parse(fs.readFileSync(fp, 'utf-8'))
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2))
}

app.get('/api/:file', (req, res) => {
  const data = readJSON(req.params.file + '.json')
  if (!data) return res.status(404).json({ error: 'not found' })
  res.json(data)
})

app.post('/api/:file', (req, res) => {
  writeJSON(req.params.file + '.json', req.body)
  res.json({ ok: true })
})

app.patch('/api/:file', (req, res) => {
  const existing = readJSON(req.params.file + '.json') || {}
  const merged = Array.isArray(existing)
    ? [...existing, req.body]
    : { ...existing, ...req.body }
  writeJSON(req.params.file + '.json', merged)
  res.json({ ok: true })
})

app.listen(3001, () => console.log('API locale → http://localhost:3001'))
