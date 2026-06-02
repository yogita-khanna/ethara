# Inventory & Order Management System

A production-ready, fully containerized full-stack application built with FastAPI (Python) and React (Vite).

## Features

- **Products**: Manage inventory, track stock levels (In Stock, Low Stock, Out of Stock).
- **Customers**: Manage customer database.
- **Orders**: Multi-step order creation, dynamic stock decrement/increment with PostgreSQL transactional locks (`WITH FOR UPDATE`).
- **Dashboard**: High-level metrics, recent orders, low stock alerts, and visual charts.
- **Robust Backend**: Built on FastAPI, async SQLAlchemy 2.0, PostgreSQL, Alembic migrations.
- **Modern Frontend**: React 18, Vite, Tailwind CSS, Zustand state management, React Query data fetching.
- **Dockerized**: Full `docker-compose` environment for local development and multi-stage Dockerfiles for production.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.12+ (for local backend development)

## Quick Start (Docker)

The easiest way to run the application is using Docker Compose.

```bash
# Start the full stack (Database, Backend, Frontend)
docker-compose up --build
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Setup Database
# Make sure you have a local postgres instance running and update .env or export DATABASE_URL
alembic upgrade head

# Run server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Running Tests (Backend)

The backend has a comprehensive test suite using `pytest` and `aiosqlite` (in-memory async database for fast testing).

```bash
cd backend
pytest -v
```

## Deployment

- **Backend**: Configured for deployment on platforms like Render (`render.yaml` provided).
- **Frontend**: Configured for deployment on Vercel (`vercel.json` provided) or static hosting.
- **Database**: PostgreSQL (requires a managed service in production like Render DB or Supabase).
