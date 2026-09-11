# Fusion Print & Services — Website

Vite + React + TypeScript + Tailwind CSS frontend for Fusion Print & Services.

## Setup

```bash
cd website
npm install
npm run dev
```

App: `http://localhost:5173`

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`. Start the backend first for live data, quotes, uploads, and admin.

Optional: set `VITE_API_URL` in `.env` if the API is on another origin.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Features

- Branded landing (navy / orange / CMYK)
- Services grid
- **Live Customize** — upload a design and preview it on t-shirt, polo, cap, mug, bag, and business card mockups
- Pricing & packages from API seed data
- Contact (phone, WhatsApp, email, address)
- Hidden admin at `/fps-admin` (not linked in nav)

## Admin (local)

- URL: `/fps-admin`
- Credentials: see `backend/.env.example` (`fpsadmin` / `FusionPrint@2026`)
