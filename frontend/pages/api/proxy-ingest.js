import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res){
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
  if (req.method !== 'POST') return res.status(405).end()

  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({error: err.message})
    try{
      // Build multipart form to backend
      const formData = new FormData()
      formData.append('title', fields.title || 'Uploaded Document')
      formData.append('doc_type', fields.doc_type || 'manual')
      if (fields.text) formData.append('text', fields.text)
      if (files.file){
        const f = files.file
        const buffer = fs.readFileSync(f.filepath)
        formData.append('file', new Blob([buffer]), f.originalFilename || 'upload.txt')
      }

      const r = await fetch(`${BACKEND}/ingest/`, {
        method: 'POST',
        body: formData
      })
      const data = await r.json()
      res.status(r.status).json(data)
    }catch(e){
      res.status(500).json({error: e.message})
    }
  })
}
