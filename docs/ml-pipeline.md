# Machine Learning Pipeline & Diagnostic Methodology

This document details the data synthesis, feature engineering, model training, and 3-layer diagnostic reasoning framework.

---

## 1. Dataset Characteristics
- **Total Observations**: 5,000 chronological records.
- **Fleet Scale**: 50 unique industrial machines (M-001 through M-050).
- **Temporal Resolution**: 100 observations per machine representing aging, mechanical wear, thermal runaway, and electrical anomalies.

---

## 2. 3-Layer Diagnostic Matrix

### Layer 1: Supervised ML Classifier
- **Algorithm**: `RandomForestClassifier` (150 estimators, balanced class weights).
- **Features**: `[temperature, vibration, pressure, voltage, current, rpm, operating_hours]`.
- **Scaler**: `StandardScaler`.
- **Target**: `Healthy` (Class 0), `Warning` (Class 1), `Critical` (Class 2).
- **Performance**:
  - Test Accuracy: **99.25%**
  - Healthy F1: **1.00**
  - Warning F1: **0.96**
  - Critical F1: **0.99**

### Layer 2: Industrial Domain Rule Engine
- Evaluates deterministic thresholds based on ISO 10816 vibration severity and mechanical thermal ratings:
  - **Temperature**: Warning &ge; 80°C, Critical &ge; 92°C
  - **Vibration**: Warning &ge; 4.2 mm/s, Critical &ge; 6.5 mm/s
  - **Pressure**: Normal range [2.5 bar, 7.5 bar]
  - **Current**: Warning &ge; 22.0 A, Critical &ge; 28.0 A
  - **Voltage**: Nominal range [370 V, 430 V]

### Layer 3: Unsupervised Anomaly Detection
- **Algorithm**: `IsolationForest` (120 estimators, contamination=0.08) trained on healthy operational baselines.
- Isolates complex multi-sensor multivariate outlier signatures that may not breach single-variable rule limits.

---

## 3. Explainability Synthesis
The aggregator combines all 3 layers into:
1. `overall_status`: Deterministic priority ranking.
2. `risk_level`: Low, Medium, High, or Critical.
3. `detected_factors`: Granular bullet points describing root causes.
4. `recommended_action`: Prescriptive maintenance guidance.
