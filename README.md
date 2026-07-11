# Earth Intelligence X (Earth IX)

Planetary intelligence, events, and mission monitoring platform. This
repository contains two independently deployable apps:

- **`backend/`** — FastAPI + SQLAlchemy + Alembic API (deploy to Render)
- **`frontend/`** — React + Vite + Tailwind dashboard (deploy to Vercel)

---

## 1. Backend (`backend/`)

FastAPI service providing auth, events, missions, and AI-powered intelligence
briefings, backed by PostgreSQL (Neon) in production and SQLite locally.

### Requirements

- Python 3.12+
- PostgreSQL database (e.g. [Neon](https://neon.tech)) for production, or
  SQLite for local development

### Local development

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env          # then fill in real values
alembic upgrade head          # create/update the database schema
python seed.py                # optional: load sample events/missions/intel

python run.py                 # starts on http://localhost:8000
# or: uvicorn app.main:app --reload
```

API docs are available at `http://localhost:8000/docs` once running.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `APP_NAME` | yes | Application name |
| `APP_ENV` | no | `development` or `production` |
| `DEBUG` | no | `True`/`False` |
| `SECRET_KEY` | yes | JWT signing secret — set a strong random value in production |
| `ALGORITHM` | no | JWT algorithm (default `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | no | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | no | Refresh token lifetime |
| `DATABASE_URL` | yes | `sqlite:///./earth_intel_x.db` locally, or a Postgres URL (`postgresql://...`) in production — automatically normalized to use the `psycopg` v3 driver |
| `FRONTEND_URL` | yes | Deployed frontend origin, used for CORS |
| `GROQ_API_KEY` | one of these two | Used for AI briefings if `OPENAI_API_KEY` isn't set |
| `OPENAI_API_KEY` | one of these two | Takes priority over Groq if set |
| `NASA_API_KEY` | no | NASA data source |
| `NASA_FIRMS_API_KEY` | no | NASA FIRMS fire data |
| `USGS_API_URL` | no | Defaults to the public USGS endpoint |
| `OPEN_METEO_BASE_URL` | no | Defaults to the public Open-Meteo endpoint |
| `GDACS_API_URL` | no | Defaults to the public GDACS endpoint |

See `.env.example` for a ready-to-copy template.

### Deploying to Render

A `render.yaml` blueprint is included at the repo root.

- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set all required env vars above in the Render dashboard (`SECRET_KEY`,
  `DATABASE_URL`, `FRONTEND_URL`, and at least one AI provider key).
- After first deploy, run migrations: `alembic upgrade head` (via a Render
  shell or a one-off job).

---

## 2. Frontend (`frontend/`)

React 18 + Vite + Tailwind CSS dashboard, using React Query for data
fetching and React Router for navigation.

### Requirements

- Node.js 18+
- npm

### Local development

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Build

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | yes | Base URL of the backend API, e.g. `http://127.0.0.1:8000` locally or your Render URL in production |

Set this in `frontend/.env` locally, and as a Vercel project environment
variable for production/preview deployments.

### Deploying to Vercel

- **Framework preset:** Vite
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- `vercel.json` is included to rewrite all routes to `index.html`, which is
  required for client-side routing (React Router) — without it, refreshing
  on any route other than `/` returns a 404.
- Set `VITE_API_URL` to your deployed backend URL in the Vercel dashboard.

---

## 3. Full local stack

1. Start the backend (`cd backend && python run.py`) on `:8000`.
2. Point `frontend/.env`'s `VITE_API_URL` at `http://127.0.0.1:8000`.
3. Start the frontend (`cd frontend && npm run dev`) on `:5173`.
4. Set the backend's `FRONTEND_URL` to `http://localhost:5173` so CORS allows it.
