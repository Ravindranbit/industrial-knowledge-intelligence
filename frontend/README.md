Frontend (Person C) — Minimal Next.js scaffold

Run locally:

```bash
cd frontend
npm install
npm run dev
```

Notes:
- The pages include simple proxy fetches to `/api/proxy-*` endpoints to avoid CORS during early dev. You can implement a Next.js API proxy or change fetch targets to the backend URL (e.g., http://localhost:8000/query).
- Build UI incrementally: start with basic flows and wire to backend endpoints once available.
