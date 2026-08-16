# Predictive Maintenance Platform — Project Overview

The **AI-Powered Predictive Maintenance & Machine Health Monitoring System** is an enterprise-grade industrial monitoring suite engineered to prevent unexpected downtime, detect anomalous mechanical stress, evaluate domain threshold breaches, and provide explainable maintenance guidance.

---

## Key Capabilities

1. **Fleet Master Registry**: Manage machines, track operating hours, specifications, locations, and deactivation states.
2. **3-Layer Health Decision Engine**:
   - **Layer 1 (ML Classification)**: Supervised Random Forest model with 99.25% test accuracy.
   - **Layer 2 (Rule-Based Thresholds)**: Industrial ISO 10816 limits evaluating temperature, vibration, pressure, current, and voltage.
   - **Layer 3 (Anomaly Detection)**: Unsupervised Isolation Forest isolating subtle multivariate equipment degradation signatures.
3. **Deterministic Explainability & Actionable Advice**: Synthesizes human-readable root causes and prescriptive instructions.
4. **Time-Series Telemetry & Historical Audit Logging**: Tracks continuous machine degradation curves over time and preserves audit history in PostgreSQL.
5. **Real-time Operations Dashboard**: Live KPIs, fleet health index, alert banners, and interactive sensor simulation presets.
