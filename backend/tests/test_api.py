"""
Backend API & Unit Tests
SPDX-License-Identifier: MIT
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.rules.maintenance_rules import rule_engine
from backend.app.ml.predictor import ml_predictor
from backend.app.services.anomaly_service import anomaly_service

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_rule_engine_healthy():
    normal_features = {
        "temperature": 62.0,
        "vibration": 1.8,
        "pressure": 5.0,
        "voltage": 400.0,
        "current": 15.0,
        "rpm": 1500.0,
        "operating_hours": 2000.0
    }
    result = rule_engine.evaluate(normal_features)
    assert result.prediction == "Healthy"
    assert len(result.violations) == 0

def test_rule_engine_critical():
    critical_features = {
        "temperature": 96.5,
        "vibration": 7.8,
        "pressure": 5.0,
        "voltage": 395.0,
        "current": 32.0,
        "rpm": 1420.0,
        "operating_hours": 5000.0
    }
    result = rule_engine.evaluate(critical_features)
    assert result.prediction == "Critical"
    assert len(result.violations) >= 2

def test_machine_lifecycle():
    # 1. Create Machine
    new_machine = {
        "machine_id": "M-TEST-999",
        "name": "Integration Test Machine",
        "type": "Hydraulic Press",
        "location": "Testing Bay 1",
        "manufacturer": "TestCorp",
        "model": "TP-100",
        "operating_hours": 100.0,
        "description": "Created for automated unit testing.",
        "active": True
    }
    create_res = client.post("/api/machines", json=new_machine)
    assert create_res.status_code in [200, 201]
    data = create_res.json()
    assert data["machine_id"] == "M-TEST-999"

    # 2. Get Machine
    get_res = client.get("/api/machines/M-TEST-999")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Integration Test Machine"

    # 3. Update Machine
    update_res = client.put("/api/machines/M-TEST-999", json={"name": "Updated Machine Name"})
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Machine Name"

    # 4. Deactivate Machine
    del_res = client.delete("/api/machines/M-TEST-999")
    assert del_res.status_code == 200

    # 5. Check Inactive Status
    get_after = client.get("/api/machines/M-TEST-999")
    assert get_after.json()["active"] is False

def test_prediction_workflow():
    payload = {
        "machine_id": "M-001",
        "temperature": 88.0,
        "vibration": 5.2,
        "pressure": 6.8,
        "voltage": 385.0,
        "current": 24.5,
        "rpm": 1470.0,
        "operating_hours": 3500.0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["machine_id"] == "M-001"
    assert data["overall_status"] in ["Healthy", "Warning", "Critical"]
    assert "ml_result" in data
    assert "rule_result" in data
    assert "anomaly_result" in data
    assert "detected_factors" in data
    assert "recommended_action" in data

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_machines" in data
    assert "fleet_health_score" in data

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "health_distribution" in data
    assert "top_at_risk_machines" in data
