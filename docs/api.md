# REST API Reference Documentation

Base URL: `http://localhost:8000`

---

## 1. System Health
### `GET /api/health`
Checks backend connectivity and model initialization status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "Predictive Maintenance & Machine Health Monitoring Platform",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-08-15T20:30:00.000000",
  "ml_model_loaded": true,
  "anomaly_model_loaded": true
}
```

---

## 2. Machine Management
### `GET /api/machines`
Lists all monitored machines with search and active filters.

**Query Parameters:**
- `search` (string, optional): Search query matching ID, name, type, location.
- `active_only` (boolean, optional): Filter active/deactivated units.
- `limit` (integer, default 100): Page limit.
- `offset` (integer, default 0): Offset.

### `GET /api/machines/{machine_id}`
Retrieves details, specifications, and current health status for a machine.

### `POST /api/machines`
Registers a new industrial machine.

**Request Body:**
```json
{
  "machine_id": "M-051",
  "name": "Robotic Welding Station #04",
  "type": "6-Axis Articulated Robot",
  "location": "Plant 2 - Robotic Cell 4",
  "manufacturer": "FANUC",
  "model": "M-20iD/25",
  "operating_hours": 1200.0,
  "description": "High-precision articulated robot arm."
}
```

### `PUT /api/machines/{machine_id}`
Updates metadata or operating hours of an existing machine.

### `DELETE /api/machines/{machine_id}`
Deactivates a machine (soft deletion preserving historical predictions).

### `GET /api/machines/{machine_id}/trend`
Retrieves chronological time-series sensor observations for degradation graphs.

---

## 3. Predictions & Diagnostics
### `POST /api/predict` (Alias: `POST /api/predictions`)
Executes the full 3-layer diagnostic analysis on input telemetry and persists the audit record in PostgreSQL.

**Request Body:**
```json
{
  "machine_id": "M-001",
  "temperature": 88.5,
  "vibration": 5.4,
  "pressure": 5.2,
  "voltage": 395.0,
  "current": 24.0,
  "rpm": 1460.0,
  "operating_hours": 4200.0
}
```

**Response (200 OK):**
```json
{
  "id": 142,
  "machine_id": "M-001",
  "overall_status": "Warning",
  "risk_level": "High",
  "ml_result": {
    "prediction": "Warning",
    "confidence": 0.94,
    "probabilities": {
      "Healthy": 0.02,
      "Warning": 0.94,
      "Critical": 0.04
    }
  },
  "rule_result": {
    "prediction": "Warning",
    "violations": [
      {
        "parameter": "temperature",
        "observed_value": 88.5,
        "threshold": 80.0,
        "severity": "Warning",
        "message": "Elevated operating temperature: 88.5°C exceeds warning limit (80.0°C)"
      },
      {
        "parameter": "vibration",
        "observed_value": 5.4,
        "threshold": 4.2,
        "severity": "Warning",
        "message": "Elevated mechanical vibration: 5.40 mm/s exceeds warning limit (4.20 mm/s)"
      }
    ]
  },
  "anomaly_result": {
    "prediction": "Normal",
    "anomaly_score": 0.78,
    "is_anomaly": false
  },
  "detected_factors": [
    "Elevated operating temperature: 88.5°C exceeds warning limit (80.0°C)",
    "Elevated mechanical vibration: 5.40 mm/s exceeds warning limit (4.20 mm/s)",
    "ML model classified state as 'Warning' with 94.0% confidence"
  ],
  "explanation": "Elevated stress parameters detected on M-001. Sensor telemetry is trending outside optimal thresholds.",
  "recommended_action": "Schedule preventative inspection within 48 hours. Monitor thermal and vibration trends closely.",
  "input_features": {
    "temperature": 88.5,
    "vibration": 5.4,
    "pressure": 5.2,
    "voltage": 395.0,
    "current": 24.0,
    "rpm": 1460.0,
    "operating_hours": 4200.0
  },
  "created_at": "2026-08-15T20:35:00.000000"
}
```

### `GET /api/predictions/history/{machine_id}`
Retrieves prediction history for a specific machine.

### `GET /api/predictions/recent`
Retrieves recent predictions across the entire fleet.

---

## 4. Dashboard & Analytics
### `GET /api/dashboard/stats`
Returns top-level KPI metrics (total machines, healthy, warning, critical, anomalies today, predictions today, fleet health index score).

### `GET /api/analytics/overview`
Returns full fleet health distribution, top at-risk machines, and recent logs.
