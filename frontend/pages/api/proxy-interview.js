export default async function handler(req, res){
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
  const { equipment_id } = req.query
  if (!equipment_id) return res.status(400).json({error: 'equipment_id required'})
  try{
    const r = await fetch(`${BACKEND}/interview/${encodeURIComponent(equipment_id)}/questions`)
    const data = await r.json()
    res.status(r.status).json(data)
  }catch(e){
    res.status(500).json({error: e.message})
  }
}
