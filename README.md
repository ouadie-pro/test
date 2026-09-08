# VisionFlow AI

A modern, full-stack AI image-to-video generation platform.
Upload a frame (or two), describe the motion, and VisionFlow turns your image into a cinematic video in seconds.

> The UI is original and inspired by professional AI video SaaS workflows. The AI video generation is
> backed by a pluggable provider — the project ships with a **mock provider** that simulates the
> full generation pipeline so the entire application works end-to-end without any external API key.

---

## Table of contents

- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [How to run](#how-to-run)
- [How it works](#how-it-works)
- [Switching to a real Image-to-Video API](#switching-to-a-real-image-to-video-api)
- [Switching to S3 / Cloudinary / R2 for storage](#switching-to-s3--cloudinary--r2-for-storage)
- [Feature tour](#feature-tour)
- [Scripts](#scripts)
- [License](#license)

---

## Highlights

- 🎬 **Real image-to-video workflow** — single-frame or two-frame (first → last) generation.
- ✍️ **Prompt composer** with character counter, "Enhance" button, and example suggestions.
- ⚙️ **Granular controls** — aspect ratio, resolution, duration, model, motion strength, camera movement.
- 💳 **Credit system** — dynamic pricing based on resolution, duration, model, and number of videos.
- 📚 **Template library** — 9 curated presets across Cinematic, Product Ads, Social Media, Anime, and more.
- 🗂️ **Asset manager** — upload, search, filter, favorite, and reuse images & videos.
- 🔍 **Global search** (`⌘K` / `Ctrl+K`) — searches across videos, assets, and templates.
- 🪪 **JWT auth** — register, login, forgot password, protected routes.
- 🔌 **Pluggable AI provider** — `MockVideoProvider` for dev, `RealVideoProvider` ready to wire.
- ☁️ **Storage abstraction** — local disk for dev, easy to swap for S3 / Cloudinary / R2.
- 🧪 **Demo mode out of the box** — no external API key required.

---

## Tech stack

| Layer        | Tech                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| Frontend     | React 18, Vite 5, TypeScript, Tailwind CSS, Radix UI primitives, Lucide icons, Zustand |
| Backend      | Node.js, Express 4, Mongoose 8, JWT, Multer, Helmet, Morgan                          |
| Database     | MongoDB                                                                               |
| Auth         | JWT (Bearer token)                                                                    |
| Storage      | Local filesystem (abstracted, see `backend/services/storageService.js`)               |
| AI provider  | Pluggable: `MockVideoProvider` (default) or `RealVideoProvider` (wire your own API)   |

---

## Project structure

```
visionflow-ai/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── controllers/        # auth, video, asset, template, credit, user
│   ├── models/             # User, Video, Asset, Template (Mongoose)
│   ├── routes/             # /api/auth, /api/videos, /api/assets, /api/templates, /api/credits, /api/users
│   ├── middleware/         # auth, multer upload
│   ├── services/           # aiVideoService, storageService
│   ├── providers/          # AIVideoProvider, MockVideoProvider, RealVideoProvider
│   ├── utils/              # seed (templates)
│   └── uploads/            # local storage destination
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── public/
    └── src/
        ├── components/     # ui/* (shadcn-style), layout/*, generator/*
        ├── pages/          # auth/*, app/*, LandingPage, PricingPage
        ├── hooks/
        ├── services/       # api, endpoints
        ├── store/          # authStore, generatorStore
        ├── lib/            # utils, credits
        ├── App.tsx
        └── main.tsx
```

---

## Quick start

```bash
# 1. Clone or copy the project
cd visionflow-ai

# 2. Install backend
cd backend
cp .env.example .env
npm install

# 3. Install frontend
cd ../frontend
cp .env.example .env
npm install
```

That's it. With MongoDB running locally you can now start both apps (see [How to run](#how-to-run)).

---

## Environment variables

### Backend — `backend/.env`

| Variable                  | Default                                      | Description                                            |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `PORT`                    | `5000`                                       | HTTP port                                              |
| `NODE_ENV`                | `development`                                |                                                        |
| `CLIENT_URL`              | `http://localhost:5173`                      | Used by CORS                                           |
| `MONGODB_URI`             | `mongodb://localhost:27017/visionflow-ai`    | MongoDB connection string                              |
| `JWT_SECRET`              | (required)                                   | Long random string. Defaults are dev-only.             |
| `JWT_EXPIRES_IN`          | `7d`                                         | Token lifetime                                         |
| `STORAGE_DRIVER`          | `local`                                      | `local` today, `s3`/`r2`/`cloudinary` future           |
| `UPLOAD_DIR`              | `uploads`                                    | Local upload directory (relative to `backend/`)        |
| `MAX_UPLOAD_SIZE_MB`      | `20`                                         | Max upload size                                        |
| `AI_VIDEO_PROVIDER`       | `mock`                                       | `mock` or `real`                                       |
| `AI_VIDEO_API_KEY`        | _empty_                                      | Required only when `AI_VIDEO_PROVIDER=real`            |
| `AI_VIDEO_API_BASE`       | _empty_                                      | Required only when `AI_VIDEO_PROVIDER=real`            |
| `AI_VIDEO_MODEL`          | `visionflow-motion-v1`                       | Optional model hint for the real provider              |

### Frontend — `frontend/.env`

| Variable             | Default | Description                          |
| -------------------- | ------- | ------------------------------------ |
| `VITE_API_BASE_URL`  | `/api`  | Base URL prepended to every request. |

The Vite dev server is also configured to proxy `/api` and `/uploads` to `http://localhost:5000`.

---

## Database setup

You need a running MongoDB instance. The simplest options are:

```bash
# Option A: Docker
docker run -d --name visionflow-mongo -p 27017:27017 -v visionflow-mongo:/data/db mongo:7

# Option B: macOS
brew services start mongodb-community

# Option C: Use a free hosted MongoDB (MongoDB Atlas)
# Update MONGODB_URI in backend/.env to your Atlas connection string.
```

Templates are seeded automatically the first time the backend starts (9 curated templates).

---

## How to run

### Development (two terminals)

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev
# → http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Production

```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm install
npm run build
# Serve the contents of frontend/dist with any static host (Nginx, Vercel, Netlify, etc.)
```

### Health check

```bash
curl http://localhost:5000/api/health
```

---

## How it works

```
┌────────────────────┐ 1. POST /api/videos/generate  ┌──────────────────┐
│   React frontend   │ ───────────────────────────► │  Express API     │
│  (Vite + Tailwind) │                              │  (Node.js)       │
│                    │ ◄─────────────────────────── │                  │
└────────────────────┘ 2. { video, creditsRemaining} └────────┬─────────┘
       │                                                     │
       │ 3. GET /api/videos/:id   (poll every ~1.5s)        │ 4. dispatch
       │ ◄──────────────────────────────────────────────────│────────────┐
       │                                                     │            │
       │                                                     │  ┌─────────▼───────────┐
       │                                                     │  │  AIVideoProvider     │
       │                                                     │  │  (Mock or Real)      │
       │                                                     │  └─────────────────────┘
       │                                                     │            │
       │ 5. status updates  (queued / processing / completed)│            │
       │ ◄──────────────────────────────────────────────────│────────────┘
       │
       │ 6. videoUrl, thumbnailUrl, progress
       │ 7. render <VideoPlayer> with Download / Share / Edit / etc.
```

### Provider layer

`backend/providers/AIVideoProvider.js` defines the contract:

```js
class AIVideoProvider {
  async generate(input) { /* returns { jobId, status, progress } */ }
  async getStatus(jobId) { /* returns { jobId, status, progress, videoUrl?, thumbnailUrl? } */ }
  async cancel(jobId) { /* returns { cancelled: true } */ }
}
```

Two concrete implementations exist:

- **`MockVideoProvider`** — simulates `queued → processing → completed` over ~6–12 seconds and returns a
  curated public-domain sample video. Used by default. Perfect for local dev, demos, and CI.
- **`RealVideoProvider`** — a clearly-marked stub. See the TODO comments inside for the request shape.

`backend/services/aiVideoService.js` orchestrates the provider and adds credit math (resolution ×
duration × model × number of videos).

---

## Switching to a real Image-to-Video API

1. Open `backend/providers/RealVideoProvider.js`.
2. Implement the three `TODO` sections in `generate()`, `getStatus()`, and `cancel()`.
   The expected request/response shapes are documented inline.
3. In `backend/.env`:

   ```env
   AI_VIDEO_PROVIDER=real
   AI_VIDEO_API_KEY=your_real_api_key
   AI_VIDEO_API_BASE=https://api.your-provider.com
   AI_VIDEO_MODEL=visionflow-motion-v1
   ```

4. Restart the backend. **No frontend changes are required** — the rest of the stack talks to the
   provider exclusively through the `AIVideoProvider` interface.

The mock provider is **not** removed when you switch; flip `AI_VIDEO_PROVIDER=mock` to go back to
demo mode at any time.

---

## Switching to S3 / Cloudinary / R2 for storage

`backend/services/storageService.js` exposes a small interface:

```js
class LocalStorageDriver {
  save(file) { /* returns { url, filename, size, mimeType } */ }
  publicUrl(filename) { /* returns '/uploads/abc.jpg' */ }
}
```

To add a new driver:

1. Create `S3StorageDriver` (or `R2StorageDriver` / `CloudinaryStorageDriver`) implementing the same methods.
2. Register it in the `getStorage()` switch.
3. Set `STORAGE_DRIVER=s3` in `backend/.env`.

The rest of the app — controllers, URL helpers, frontend `absoluteUrl()` — already accepts both
relative (`/uploads/...`) and absolute (`https://...`) URLs.

---

## Feature tour

| Route                          | Page                          | What it does                                                  |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------- |
| `/`                            | Landing                       | Marketing intro with features, workflow, FAQ                  |
| `/login` · `/register`         | Auth                          | Email + password, JWT, forgot password                        |
| `/pricing`                     | Pricing                       | Free / Starter / Pro / Enterprise with upgrade flow          |
| `/app`                         | **Image-to-Video Generator**  | The main workhorse. Upload, prompt, settings, generate        |
| `/app/videos`                  | My Videos                     | Gallery with status filters + sort                            |
| `/app/videos/:id`              | Video detail                  | Live progress, player, download, share, edit, retry, cancel  |
| `/app/assets`                  | Assets                        | Upload, search, filter, reuse in generator                    |
| `/app/templates`               | Templates                     | 9 curated presets, one-click "Use Template"                  |
| `/app/templates/:id`           | Template detail               | Preview + prompt + settings, "Use Template"                  |
| `/app/scheduled`               | Scheduled                     | Placeholder for future scheduling                             |
| `/app/api`                     | API Keys                      | Create, copy, reveal, revoke API keys                         |
| `/app/settings`                | Settings                      | Profile · Account · Security · Notifications · Billing        |
| `/app/help`                    | Help & Support                | FAQ, docs link, contact                                       |
| `/app/search`                  | Search                        | Full-page search; `⌘K` opens the search modal anywhere        |

### Global search

Press **`⌘K`** (macOS) or **`Ctrl+K`** (Windows/Linux) from any dashboard page to open the global
search modal. It searches across videos, assets, and templates in real time.

### Credit system

Generation cost is computed in `backend/services/aiVideoService.js` and the matching
`frontend/src/lib/credits.ts`:

```
credits = ceil( base × (duration / 5) × modelFactor × numberOfVideos )
```

| Resolution | Base |
| ---------- | ---- |
| 480p       | 30   |
| 720p       | 60   |
| 1080p      | 120  |

| Model               | Factor |
| ------------------- | ------ |
| VisionFlow Fast     | 0.6    |
| VisionFlow Motion   | 1.0    |
| VisionFlow Cinematic| 1.5    |

If a user has fewer credits than required, the API returns `402 Payment Required` with code
`INSUFFICIENT_CREDITS`, the frontend blocks the button, and a clear "Upgrade Plan" CTA is shown.

---

## Scripts

### Backend
- `npm run dev` — start with nodemon
- `npm start` — start in production mode
- `npm run seed` — re-seed templates

### Frontend
- `npm run dev` — start Vite dev server on :5173
- `npm run build` — type-check + production build
- `npm run preview` — preview the production build

---

## Security notes

- Passwords are hashed with bcrypt (10 rounds).
- JWTs are signed with `JWT_SECRET` (set your own in production).
- The API key list endpoint never returns the **plaintext** key after creation — copy it when it's shown.
- API keys, secrets, and provider keys are **server-side only**. The frontend talks exclusively to
  `/api/...` through the Vite dev proxy or your production reverse proxy.

---

## License

MIT — feel free to use this as a starting point for your own AI video SaaS.
