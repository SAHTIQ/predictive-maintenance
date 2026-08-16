# PredictiveGuard — Industrial Predictive Maintenance & Machine Health Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg)](https://scikit-learn.org)

An industrial-grade, full-stack predictive maintenance platform featuring **3-layer health intelligence** (Supervised ML Classification, Configurable Industrial Rule Engine, and Unsupervised Isolation Forest Anomaly Detection), persistent PostgreSQL telemetry/prediction storage, machine lifecycle management, chronological degradation analytics, and a responsive operations dashboard.

---

## 🌟 Key Features

1. **Operations Dashboard**:
   - Fleet-wide KPI counters (Total Units, Healthy, Warning, Critical, Anomalies Detected, Predictions Run).
   - Real-time Machine Health Distribution donut & bar charts.
   - Live Priority Maintenance Alerts feed.
   - Recent 3-Layer diagnostic event logs.
2. **Machine Fleet Management**:
   - Comprehensive machine registry (ID, Name, Type, Location, Manufacturer, Model, Runtime Hours).
   - Add new machines with custom specifications.
   - Soft-delete deactivation preserving historical telemetry.
   - Search & multi-status filtering.
3. **Machine Details & Telemetry Inspection**:
   - Live sensor gauges (Temperature, Vibration, Pressure, Voltage, Current, RPM).
   - Time-series degradation curves (Thermal/Vibration and Electrical/Hydraulic profiles).
   - Chronological machine diagnostic logs.
4. **3-Layer Diagnostic Studio (`/predict`)**:
   - **Layer 1 (Supervised ML Classifier)**: Random Forest Classifier (150 trees) predicting `Healthy`, `Warning`, or `Critical` with confidence probabilities (99.25% test accuracy).
   - **Layer 2 (Industrial Rule Engine)**: ISO 10816 domain rule limits identifying parameter violations.
   - **Layer 3 (Anomaly Engine)**: Unsupervised Isolation Forest model isolating multi-sensor outliers.
   - **Deterministic Aggregator**: Combines all 3 layers, calculates risk levels, generates root-cause explanations, and provides actionable recommendations.
   - **Quick Presets**: `Normal Baseline`, `Elevated Temperature Warning`, `Critical Bearing Failure`, `Electrical Surge Anomaly`.
5. **Audit History & Drill-Down (`/history`)**:
   - Filterable table of past diagnostic predictions.
   - Drill-down modal inspecting exact feature vectors, layer outputs, and notes.
6. **Fleet Analytics (`/analytics`)**:
   - Comparative machine health distributions and operating hours rankings.
   - Fleet priority risk ranking queue.

---

## 🏛️ System Architecture

```
                         ┌──────────────────────────────────────────────────────────┐
                         │              FRONTEND (React + Vite + TS)               │
                         │   Tailwind CSS  │  Recharts  │  Lucide  │  React Router  │
                         └────────────────────────────┬─────────────────────────────┘
                                                      │ REST JSON API
                                                      ▼
                         ┌──────────────────────────────────────────────────────────┐
                         │                    BACKEND (FastAPI)                     │
                         │   Machine API  │ Prediction API │ History API │ Health   │
                         └────────────────────────────┬─────────────────────────────┘
                                                      │
                 ┌────────────────────────────────────┼────────────────────────────────────┐
                 │                                    │                                    │
                 ▼                                    ▼                                    ▼
       ┌────────────────────┐               ┌──────────────────┐                 ┌────────────────────┐
       │   Layer 1: ML      │               │  Layer 2: Rules  │                 │  Layer 3: Anomaly  │
       │   Random Forest    │               │  Operating Rule  │                 │  Isolation Forest  │
       │   Classification   │               │  Threshold Engine│                 │  Contamination Det.│
       └─────────┬──────────┘               └─────────┬────────┘                 └──────────┬─────────┘
                 │                                    │                                     │
                 └────────────────────────────────────┼─────────────────────────────────────┘
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │   Deterministic Aggregator  │
                                       │   + Human Explanation Gen   │
                                       └──────────────┬──────────────┘
                                                      │
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │   PostgreSQL / Data Access  │
                                       │   machines, predictions,    │
                                       │   sensor_readings           │
                                       └─────────────────────────────┘
```

---

## 📁 Repository Structure

```text
predictive-maintenance/
├── backend/
│   ├── app/
│   │   ├── ml/                 # ML predictor, scaler & model loader
│   │   ├── routes/             # FastAPI route controllers
│   │   ├── rules/              # Layer 2 Industrial Domain Rule Engine
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic & 3-layer aggregation
│   │   ├── utils/              # Structured logger & utilities
│   │   ├── config.py           # Application settings & thresholds
│   │   ├── database.py         # SQLAlchemy engine with SQLite/Postgres fallback
│   │   └── main.py             # Application entry point
│   ├── tests/                  # Unit and integration test suite
│   ├── requirements.txt        # Python backend dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts
│   │   ├── pages/              # Dashboard, Machines, Prediction, History, etc.
│   │   ├── services/           # Typed REST API client
│   │   ├── types/              # TypeScript models
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── database/
│   ├── schema.sql              # PostgreSQL DDL
│   └── seed.sql
├── ml/
│   ├── data/                   # 5,000-row industrial dataset
│   └── models/                 # Serialized joblib artifacts & metadata
├── scripts/
│   ├── generate_dataset.py     # 5,000-row chronological dataset generator
│   ├── train_model.py          # ML & Anomaly training pipeline
│   └── seed_database.py        # Database seeder (50 machines + telemetry)
├── docs/                       # Architecture, API, Database, ML & Deployment docs
├── docker-compose.yml          # Multi-container deployment
├── LICENSE                     # Standard MIT License
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend & ML Setup
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Generate 5,000-row temporal dataset & train ML/Anomaly models
python scripts/generate_dataset.py
python scripts/train_model.py

# 3. Seed Database (50 machines, telemetry, and past predictions)
python scripts/seed_database.py

# 4. Start FastAPI Backend Server
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Tests

Run backend unit and integration test suite:
```bash
python -m pytest backend/tests/
```

Run frontend production bundle build:
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE) (SPDX-License-Identifier: `MIT`).
