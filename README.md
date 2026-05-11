# Hop In

Intercity carpooling platform for Albania. Connects drivers and passengers for shared trips between cities.

**Team C1 — Epoka University:** Albert Kola, Roena Vrana, Elert Xhaferaj, Anisa Rami, Endri Hysaj

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS (Uber-style dark theme)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Auth:** JWT + bcrypt
- **Containers:** Docker Compose

## Quick Start

```bash
# 1. Start infrastructure (Postgres + Redis)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run dev

# 3. Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Backend: http://localhost:5000  
Frontend: http://localhost:5173

## Project Structure

```
hop-in/
├── backend/        Express API (routes → controllers → services → models)
├── frontend/       React SPA (pages, components, hooks, context)
├── docker-compose.yml
└── README.md
```

The DB schema auto-loads from `backend/migrations/` on first `docker compose up`.
