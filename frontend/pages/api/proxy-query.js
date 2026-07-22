export default async function handler(req, res) {
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const r = await fetch(`${BACKEND}/query/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body),
    })
    const data = await r.json()
    res.status(r.status).json(data)
  } catch (e) {
    res.status(500).json({error: e.message})
  }
}
