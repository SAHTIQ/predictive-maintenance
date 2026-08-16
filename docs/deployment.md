# Deployment Guide — Predictive Maintenance Platform

---

## 1. Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL 14+ (or automatic SQLite fallback)

### Step 1: Clone and Configure Environment
```bash
git clone <repo-url>
cd "predictive-maintenance"
cp .env.example .env
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

### Step 3: Dataset Generation & Model Training
```bash
cd ..
python scripts/generate_dataset.py
python scripts/train_model.py
python scripts/seed_database.py
```

### Step 4: Run Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### Step 5: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend web application available at: `http://localhost:5173`

---

## 2. Docker Deployment
Run the entire multi-container stack with Docker Compose:
```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
