export default async function handler(req, res){
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
  try{
    const r = await fetch(`${BACKEND}/dashboard-summary/`)
    const data = await r.json()
    res.status(r.status).json(data)
  }catch(e){
    res.status(500).json({error: e.message})
  }
}
