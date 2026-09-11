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

Optional: set `VITE_API_URL` in `.env` if the API is on another origin (see `.env.example`).

## Deploy on Coolify

This repository is the **frontend only** (Vite SPA). Point Coolify at:

`https://github.com/NuthalapatiSrinath/Fusion-Print-Service.git`

Use **HTTPS** for the Git source URL so Coolify does not need your GitHub SSH key. If you prefer `git@github.com:...`, add Coolify’s SSH public key under GitHub → **Settings → SSH and GPG keys** (or as a deploy key on this repo).

| Setting | Value |
|--------|--------|
| Build pack | **Dockerfile** (recommended) |
| Dockerfile location | `./Dockerfile` |
| Port | `80` |
| Build-time env | `VITE_API_URL` = full backend URL (e.g. `https://api.example.com`). Leave empty only if the API is on the same origin behind your reverse proxy. |

Nixpacks can run `npm run build`, but you still need a static file server and SPA routing; the included Dockerfile + nginx handles both.

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
