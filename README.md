# Front Desk PMS — Property & Hotel Management System

A room inventory system for a hotel front office. An administrator signs in, browses the room list, adds rooms and opens each room's details. Rooms are stored in a cloud PostgreSQL database through a Laravel REST API.

```
React SPA (Vite, React Router)  ── HTTPS / JSON ──▶  Laravel 13 REST API  ──▶  PostgreSQL (Supabase)
frontend/  → Vercel                                   backend/ → Render (Docker)
```

## Project structure

```
frontend/                     React + Vite single-page app
  src/
    components/               ProtectedRoute, RoomTag (key-fob room number), Notice (inline messages)
    hooks/                    useAuth (sign-in state), useApi (loading/error/data), useDocumentTitle
    layouts/AppLayout.jsx     Top bar and navigation for signed-in screens
    pages/                    Login, RoomList, AddRoom, RoomDetails
    services/api.js           The only place that calls the API (GET/POST, error handling)
    services/rooms.js         Room categories and peso/date formatting
  vercel.json                 SPA rewrite so /rooms/5 works on refresh

backend/                      Laravel 13 API
  app/Models/HotelRoom.php
  app/Http/Controllers/HotelRoomController.php
  app/Http/Requests/StoreHotelRoomRequest.php     Validation rules and messages
  app/Http/Resources/HotelRoomResource.php        JSON shape of a room
  database/migrations/2026_10_14_000000_create_hotel_rooms_table.php
  routes/api.php
  config/cors.php
  tests/Feature/HotelRoomApiTest.php
  Dockerfile, docker/start.sh                     Production image for Render
```

## API

| Method | Endpoint          | Success                      | Errors |
|--------|-------------------|------------------------------|--------|
| GET    | `/api/rooms`      | `200 { data: [room, …] }`    | |
| POST   | `/api/rooms`      | `201 { data: room, message }`| `422 { message, errors: { field: [msg] } }` |
| GET    | `/api/rooms/{id}` | `200 { data: room }`         | `404 { message: "Room not found." }` |
| GET    | `/api/health`     | `200 { status, database, rooms_stored }` | `503` if the database is unreachable |

A room: `id`, `room_number`, `room_type`, `nightly_rate`, `capacity`, `notes`, `created_at`, `updated_at`.

Validation: room number required, unique, letters/numbers/dashes, max 10 characters. Category must be Standard Single, Deluxe Double, Executive Suite or Penthouse. Nightly rate required, greater than 0, max 2 decimals. Capacity (1–12 guests) and notes (500 characters) are optional.

## Run locally

Requirements: PHP 8.3+, Composer, Node 20+.

**Backend**

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Either paste a Postgres connection string into `DB_URL` in `.env`, or use SQLite for a quick local run:

```bash
# in .env: DB_CONNECTION=sqlite and DB_URL= (empty)
touch database/database.sqlite
```

Then:

```bash
php artisan migrate
php artisan serve          # http://localhost:8000
php artisan test           # runs the API feature tests
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (uses .env.development → http://localhost:8000/api)
```

Sign in with `pms_admin` / `hotelpms2026`.

## Deploy

Push this folder to GitHub first (one repo with `frontend/` and `backend/` works; each host is pointed at its own folder).

### 1. Database — Supabase

1. Create a project at supabase.com and note the database password.
2. Open **Connect** and copy the **Session pooler** connection string (port 5432). Render can't reach Supabase's direct connection host, and the transaction pooler (port 6543) breaks Laravel's prepared statements.
3. Put your password in place of `[YOUR-PASSWORD]`. If the password contains symbols like `@ # / ?`, URL-encode them (or reset the password to letters and numbers).

### 2. API — Render

1. **New → Web Service**, connect the repo.
2. Root Directory: `backend`. Runtime/Language: **Docker**. Instance type: Free.
3. Health check path: `/up`.
4. Environment variables:

| Key | Value |
|-----|-------|
| `APP_KEY` | `base64:…` — generate with `php artisan key:generate --show` (or `php -r "echo 'base64:'.base64_encode(random_bytes(32));"`) |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | your Render URL, e.g. `https://hotel-pms-api.onrender.com` |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | the Supabase session pooler string |
| `DB_SSLMODE` | `require` |
| `LOG_CHANNEL` | `stderr` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` for now; the Vercel URL is added in step 4 |

5. Deploy. On every start the container runs `php artisan migrate --force`, which creates `hotel_rooms` the first time and skips it afterwards, so existing rooms are kept.
6. Check `https://<your-api>.onrender.com/api/health` shows `"status": "ok"`.

The free Render plan sleeps after 15 minutes without traffic; the first request afterwards can take about a minute. The app shows an inline "wait a minute if the server is waking up" message if that request fails. Open the API URL once before a demo.

### 3. Frontend — Vercel

1. **Add New → Project**, import the repo.
2. Root Directory: `frontend`. Framework preset: Vite (build `npm run build`, output `dist`).
3. Environment variable: `VITE_API_BASE_URL` = `https://<your-api>.onrender.com/api` (no trailing slash).
4. Deploy.

### 4. Allow the frontend to call the API

Back in Render, set `CORS_ALLOWED_ORIGINS` to

```
https://<your-app>.vercel.app,http://localhost:5173
```

(no trailing slashes) and save; Render redeploys. If you change the Vercel URL later, update this too.

## Submission checklist

| # | Evidence | How to capture it |
|---|----------|-------------------|
| 1 | Frontend URL | Vercel project URL |
| 2 | API base URL | `https://<your-api>.onrender.com/api` |
| 3 | Failed login with inline error | Sign in with a wrong password; the red message appears under the fields |
| 4 | Room List right after login | Sign in with `pms_admin` / `hotelpms2026` |
| 5 | Add Room with all fields filled | Fill every field, screenshot before pressing **Save room** |
| 6 | Room Details of the new room | After saving, click the new (highlighted) row |
| 7 | Data persists across redeploys | See below |

**Persistence evidence (item 7)**

1. Screenshot `/api/health` showing `rooms_stored`, and the Room List.
2. In Render, run **Manual Deploy → Deploy latest commit** (or **Restart service**). Screenshot the finished deploy in the Events/Logs tab.
3. Reload the Room List and `/api/health`: same rooms, same count.
4. In Supabase, **Table Editor → hotel_rooms** shows the same rows. Screenshot it.

The printed brief's "Add Station Screen" is treated as the Add Room screen.

## Notes on the brief

- Sign-in is checked in the browser against the hardcoded credentials, as the brief requires, and only a signed-in flag is kept in `sessionStorage` (refreshing keeps you signed in; closing the browser signs you out). Room records are never stored in the browser; every screen reads them from the API.
- Because sign-in is client-side, the API endpoints themselves are not password-protected. That matches the assignment scope; a production system would add token authentication (for example Laravel Sanctum).
- No `alert()` or `confirm()` is used anywhere. All validation, API errors, empty states and confirmations render inline.
