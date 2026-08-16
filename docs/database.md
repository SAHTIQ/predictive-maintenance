# Database Schema & Data Access Layer

The platform utilizes a relational PostgreSQL database schema with indexes optimized for time-series telemetry retrieval and prediction queries.

---

## 1. Entity Relationship Overview

```
 ┌────────────────────────────────────────────────────────┐
 │                        MACHINES                        │
 ├────────────────────────────────────────────────────────┤
 │ id (PK)                                               │
 │ machine_id (UNIQUE, Indexed)                           │
 │ name                                                   │
 │ type                                                   │
 │ location                                               │
 │ manufacturer                                           │
 │ model                                                  │
 │ installation_date                                      │
 │ operating_hours                                        │
 │ description                                            │
 │ active (Indexed)                                       │
 │ created_at, updated_at                                 │
 └──────────────────────────┬─────────────────────────────┘
                            │ 1:N
           ┌────────────────┴────────────────┐
           ▼                                 ▼
 ┌──────────────────────────┐      ┌──────────────────────────┐
 │     SENSOR_READINGS      │      │       PREDICTIONS        │
 ├──────────────────────────┤      ├──────────────────────────┤
 │ id (PK)                  │      │ id (PK)                  │
 │ machine_id (FK, Indexed) │      │ machine_id (FK, Indexed) │
 │ temperature              │      │ ml_prediction            │
 │ vibration                │      │ ml_confidence            │
 │ pressure                 │      │ rule_prediction          │
 │ voltage                  │      │ rule_violations (JSONB)  │
 │ current                  │      │ anomaly_prediction       │
 │ rpm                      │      │ anomaly_score            │
 │ operating_hours          │      │ overall_status (Indexed) │
 │ recorded_at (Indexed)    │      │ risk_level               │
 └──────────────────────────┘      │ explanation              │
                                   │ recommended_action       │
                                   │ input_features (JSONB)   │
                                   │ created_at (Indexed)     │
                                   └──────────────────────────┘
```

---

## 2. Table Specifications

### `machines`
Stores master registry of monitored equipment. Soft deletions are performed via `active = FALSE` to safeguard historical time-series telemetry.

### `sensor_readings`
Time-series log of chronological measurements collected per machine.

### `predictions`
Audit logs capturing full 3-layer outputs (ML, Rules, Anomaly Isolation Forest), user input features, synthesized explanations, and timestamps.
