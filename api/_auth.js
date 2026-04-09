import jwt from 'jsonwebtoken'

export function verifyToken(req) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) throw new Error('Non authentifié')
  return jwt.verify(auth.slice(7), process.env.JWT_SECRET)
}

export function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
}
