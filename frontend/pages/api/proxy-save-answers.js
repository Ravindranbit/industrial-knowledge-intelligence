export default async function handler(req, res){
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
  if (req.method !== 'POST') return res.status(405).end()
  try{
    const body = req.body || {}
    const equipment_id = body.equipment_id
    if (!equipment_id) return res.status(400).json({error:'equipment_id required'})

    // Normalize answers: allow array of {question,answer} or dict
    let answersObj = {}
    if (Array.isArray(body.answers)){
      body.answers.forEach(item => { if (item.question) answersObj[item.question] = item.answer })
    } else if (typeof body.answers === 'object'){
      answersObj = body.answers
    }

    const payload = {
      technician_name: body.technician_name || 'Field Technician',
      answers: answersObj
    }

    const r = await fetch(`${BACKEND}/interview/${encodeURIComponent(equipment_id)}/answers`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    res.status(r.status).json(data)
  }catch(e){
    res.status(500).json({error: e.message})
  }
}
