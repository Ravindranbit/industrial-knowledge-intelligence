Frontend (Person C) — Enterprise Next.js dashboard

Run locally:

```bash
cd frontend
npm install
npm run dev
```

Notes:
- The app provides an enterprise-style workspace shell, AI chat, compliance monitoring, guided interview flow, document intake, and alerts.
- Frontend requests are proxied through Next.js API routes under `/api/proxy-*` so the backend contract stays unchanged.
- The UI is optimized for production polish: cards, contextual metadata, better empty states, and subtle motion.
