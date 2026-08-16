# System Architecture — AI Predictive Maintenance & Machine Health Platform

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

## 1. Architectural Layers

### Frontend
- **Framework**: React 18 with Vite and TypeScript for type safety and fast development.
- **Styling**: Tailwind CSS with an industrial dark mode theme optimized for control room visibility.
- **Visualizations**: Recharts for time-series degradation tracking, health distribution donut charts, and risk rankings.
- **Navigation**: React Router 6 providing responsive routes for Dashboard, Machines, Machine Details, Prediction Studio, History, Analytics, and Settings.

### Backend
- **Framework**: FastAPI (Python 3.10+) with Pydantic v2 schemas and asynchronous routing.
- **Data Access**: SQLAlchemy ORM with PostgreSQL database engine and automatic SQLite fallback mode.
- **Design Pattern**: Multi-layer separation of concerns (API Routes -> Service Layer -> Diagnostic Intelligence Engines -> Database Models).

### 3-Layer Diagnostic Intelligence
1. **Layer 1 (Supervised ML Classifier)**: Random Forest Classifier (150 estimators) predicting health states (`Healthy`, `Warning`, `Critical`) with probability confidence scores.
2. **Layer 2 (Industrial Rule Engine)**: Evaluates deterministic mechanical boundaries (ISO 10816 standards) across temperature, vibration, pressure, current, and voltage.
3. **Layer 3 (Unsupervised Anomaly Detection)**: Isolation Forest isolating multi-dimensional sensor outliers.
4. **Deterministic Aggregator**: Combines all 3 layers, synthesizes human-readable root-cause explanations, and outputs actionable maintenance recommendations.
