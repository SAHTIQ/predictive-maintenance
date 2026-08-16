-- =============================================================================
-- Predictive Maintenance Platform - PostgreSQL Schema
-- SPDX-License-Identifier: MIT
-- =============================================================================

-- 1. Machines Table
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    manufacturer VARCHAR(150),
    model VARCHAR(100),
    installation_date DATE DEFAULT CURRENT_DATE,
    operating_hours DOUBLE PRECISION DEFAULT 0.0,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_machines_machine_id ON machines(machine_id);
CREATE INDEX IF NOT EXISTS idx_machines_active ON machines(active);

-- 2. Sensor Readings (Telemetry Time-Series) Table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    vibration DOUBLE PRECISION NOT NULL,
    pressure DOUBLE PRECISION NOT NULL,
    voltage DOUBLE PRECISION NOT NULL,
    current DOUBLE PRECISION NOT NULL,
    rpm DOUBLE PRECISION NOT NULL,
    operating_hours DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensor_machine FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sensor_machine_id ON sensor_readings(machine_id);
CREATE INDEX IF NOT EXISTS idx_sensor_recorded_at ON sensor_readings(recorded_at);

-- 3. Predictions Table (3-Layer Audit Logs)
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    machine_id VARCHAR(50) NOT NULL,
    ml_prediction VARCHAR(50) NOT NULL,
    ml_confidence DOUBLE PRECISION NOT NULL,
    rule_prediction VARCHAR(50) NOT NULL,
    rule_violations JSONB DEFAULT '[]'::jsonb,
    anomaly_prediction VARCHAR(50) NOT NULL,
    anomaly_score DOUBLE PRECISION NOT NULL,
    overall_status VARCHAR(50) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    explanation TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    input_features JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pred_machine FOREIGN KEY (machine_id) REFERENCES machines(machine_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pred_machine_id ON predictions(machine_id);
CREATE INDEX IF NOT EXISTS idx_pred_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_pred_overall_status ON predictions(overall_status);
