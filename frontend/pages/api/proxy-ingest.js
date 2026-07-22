import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res){
  const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'
  if (req.method !== 'POST') return res.status(405).end()

  const formFn = typeof formidable === 'function' ? formidable : (formidable.default || formidable.IncomingForm)
  const form = typeof formFn === 'function' ? formFn() : new formFn()

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({error: err.message})
    try{
      const getVal = (val) => Array.isArray(val) ? val[0] : val

      // Build multipart form to backend
      const formData = new FormData()
      formData.append('title', getVal(fields.title) || 'Uploaded Document')
      formData.append('doc_type', getVal(fields.doc_type) || 'manual')
      if (fields.text) formData.append('text', getVal(fields.text))
      if (files.file){
        const f = getVal(files.file)
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
