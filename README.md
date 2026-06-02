# Inventory & Order Management System

A production-ready, fully containerized full-stack application built with FastAPI (Python) and React (Vite).

## 🚀 Live Deployment Links (Submission)

- **Frontend Application (Vercel)**: [https://ethara-self-five.vercel.app](https://ethara-self-five.vercel.app)
- **Backend API URL (Render)**: [https://ethara-9vxr.onrender.com/api/v1](https://ethara-9vxr.onrender.com/api/v1)
- **API Documentation (Swagger UI)**: [https://ethara-9vxr.onrender.com/api/docs](https://ethara-9vxr.onrender.com/api/docs)
- **Docker Hub Image**: [https://hub.docker.com/r/yogitakhanna/inventory-backend](https://hub.docker.com/r/yogitakhanna/inventory-backend)

---

## 📋 Project Requirements & Architecture

This project was built to strictly fulfill the provided Technical Assessment requirements:

### Backend Architecture
- **Framework**: Python FastAPI for high-performance async APIs.
- **Database**: PostgreSQL with async SQLAlchemy 2.0.
- **Migrations**: Alembic for robust database schema versioning.
- **Business Logic**: Strictly enforced rules (unique SKUs/emails, non-negative quantities, transactional locks during order placement to prevent race conditions).

### Frontend Architecture
- **Framework**: React 18 powered by Vite.
- **Styling**: Tailwind CSS for a responsive, clean, and modern UI.
- **State Management**: Zustand for global state.
- **API Integration**: React Query for caching, automatic refetching, and loading states.
- **Components**: Modular and reusable component architecture (e.g., Modals, Forms, Tables).

---

## 🐳 Docker Configuration & Local Ports

The application is fully containerized with a `docker-compose.yml` for local orchestration and production-ready `Dockerfile`s for each service.

When starting the server locally via Docker Compose, the following ports are mapped on the host machine:

- **Frontend App**: `http://localhost:3001` (Internal Container Port: `3000`)
- **Backend API**: `http://localhost:8000` (Internal Container Port: `8000`)
- **API Swagger Documentation**: `http://localhost:8000/api/docs`
- **PostgreSQL Database**: `localhost:5432` (Internal Container Port: `5432`)

### 📦 Running the Pre-built Docker Hub Image

Instead of building locally, you can pull and run the backend image directly from Docker Hub:

```bash
# Pull the latest image
docker pull yogitakhanna/inventory-backend:latest

# Run the image (ensure your database environment variables are configured)
docker run -d -p 8000:8000 --env-file .env yogitakhanna/inventory-backend:latest
```

---

## 💻 Local Setup Instructions

You can run this system locally either via **Docker Compose (Recommended)** or **Natively (without Docker)**.

### Option A: Docker Compose (Quickest)

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd inventory-system
   ```

2. **Set up environment variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. **Start the containers**:
   ```bash
   docker-compose up --build
   ```
   *Note: Database tables (Alembic migrations) are automatically applied, and mock data is seeded automatically on startup.*

4. **Access the application**:
   - Frontend Dashboard: [http://localhost:3001](http://localhost:3001)
   - Swagger API Docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

### Option B: Native Setup (Without Docker)

#### 1. Database Setup
Ensure you have a PostgreSQL server running locally. Create a database named `inventory_db`.

#### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder matching your local database credentials:
   ```env
   DATABASE_URL=postgresql+asyncpg://<username>:<password>@localhost:5432/inventory_db
   SYNC_DATABASE_URL=postgresql+psycopg2://<username>:<password>@localhost:5432/inventory_db
   ENVIRONMENT=development
   ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
   ```
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. (Optional) Seed the database with mock data:
   ```bash
   python seed.py
   ```
7. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder to point to your local backend API:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
4. Start the frontend server on port `3001`:
   ```bash
   npm run dev -- --port 3001
   ```
5. Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## ☁️ Deployment Instructions

### Backend Deployment (Render / PostgreSQL)
1. **Database**: Spin up a managed PostgreSQL database instance on Render.
2. **Web Service**: Connect your GitHub repository to Render and create a Web Service.
   - **Environment**: Python
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. **Environment Variables**: Add keys for `DATABASE_URL` (using asyncpg connection string), `ENVIRONMENT=production`, and `ALLOWED_ORIGINS` (pointing to your Vercel URL).

### Frontend Deployment (Vercel)
1. Import the project root into Vercel.
2. Configure the directory settings to target the `frontend` subdirectory.
3. Add an Environment Variable `VITE_API_URL` pointing to your deployed backend API URL (e.g. `https://ethara-9vxr.onrender.com/api/v1`).
4. Click **Deploy**. Vercel will build the production assets using Vite and serve them globally.

---

## 🛡️ Best Practices Followed

1. **Security**: No hardcoded credentials. All secrets are managed via `.env` variables and kept strictly out of version control.
2. **Concurrency & Safety**: Used `WITH FOR UPDATE` in PostgreSQL to lock rows during order placement. This prevents race conditions and inventory overselling when multiple users try to buy the last item simultaneously.
3. **Containerization**: Used `slim` base images to keep Docker images lightweight and secure. Implemented multi-stage builds for the frontend to reduce the final image size.
4. **Idempotent Seeding**: Created an `entrypoint.sh` script that safely seeds the database automatically on startup, but skips if data already exists.
5. **Robust Error Handling**: Implemented custom FastAPI Exception Handlers to return standardized JSON error responses with correct HTTP status codes (e.g. 404 Not Found, 409 Conflict, 422 Unprocessable Entity).

---

## 🧪 Test Coverage

The backend application includes automated test suites covering product management, customer interactions, and order processing logic. 

**To run the test suite and view the coverage report:**
```bash
docker-compose exec backend pytest --cov=app --cov-report=term-missing
```

### Coverage Report
```text
Name                                Stmts   Miss  Cover   Missing
-----------------------------------------------------------------
app/__init__.py                         0      0   100%
app/config.py                          27      2    93%   12, 14
app/database.py                        10      2    80%   21-22
app/exceptions.py                      31      0   100%
app/main.py                            48      6    88%   38, 42, 95-96, 103-104
app/models/__init__.py                  4      0   100%
app/models/customer.py                 16      0   100%
app/models/order.py                    39      0   100%
app/models/product.py                  17      0   100%
app/routers/__init__.py                 5      0   100%
app/routers/customers.py               27      2    93%   33-34
app/routers/dashboard.py               10      0   100%
app/routers/orders.py                  23      0   100%
app/routers/products.py                27      0   100%
app/schemas/__init__.py                 4      0   100%
app/schemas/customer.py                36      6    83%   18, 38-42
app/schemas/order.py                   40      0   100%
app/schemas/product.py                 44      5    89%   18, 20, 45, 48, 50
app/services/__init__.py                5      0   100%
app/services/customer_service.py       55     31    44%   17-24, 29, 33, 38-41, 44-58, 64-70
app/services/dashboard_service.py      35     23    34%   17-67
app/services/order_service.py          71     43    39%   23-85, 94, 102-105, 111-123
app/services/product_service.py        58     31    47%   19-26, 31, 33, 37, 42-45, 50-62, 68-74
-----------------------------------------------------------------
TOTAL                                 632    151    76%

======================== 32 passed, 3 warnings in 2.70s ========================
```

### Coverage Report Screenshot
*(Insert your screenshot here)*
![Test Coverage Report](./coverage-screenshot.png)

