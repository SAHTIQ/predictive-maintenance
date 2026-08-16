"""
Machine Learning Training Pipeline for Predictive Maintenance
SPDX-License-Identifier: MIT
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

FEATURE_COLUMNS = [
    "temperature",
    "vibration",
    "pressure",
    "voltage",
    "current",
    "rpm",
    "operating_hours"
]

TARGET_COLUMN = "health_status"

def train_pipeline():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "ml", "data", "predictive_maintenance_dataset.csv")
    models_dir = os.path.join(base_dir, "ml", "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run generate_dataset.py first.")

    print(f"Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)

    # Machine-stratified split or temporal split:
    # 35 machines for training (3500 rows), 7 machines for validation (700 rows), 8 machines for testing (800 rows)
    # This evaluates both temporal degradation and fleet-wide generalizability across unseen machines
    all_machines = sorted(df["machine_id"].unique())
    train_machines = all_machines[:35]
    val_machines = all_machines[35:42]
    test_machines = all_machines[42:]

    train_df = df[df["machine_id"].isin(train_machines)].copy()
    val_df = df[df["machine_id"].isin(val_machines)].copy()
    test_df = df[df["machine_id"].isin(test_machines)].copy()

    print(f"Machine Split - Train ({len(train_machines)} machines): {len(train_df)} | Val ({len(val_machines)} machines): {len(val_df)} | Test ({len(test_machines)} machines): {len(test_df)}")

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN]

    X_val = val_df[FEATURE_COLUMNS]
    y_val = val_df[TARGET_COLUMN]

    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN]

    # Preprocessing Scaler
    print("Fitting StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # 1. Supervised Random Forest Classifier
    print("Training RandomForestClassifier...")
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=15,
        min_samples_split=3,
        min_samples_leaf=1,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)

    # Test Evaluation
    y_test_pred = rf_model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_test_pred)
    report = classification_report(y_test, y_test_pred, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, y_test_pred, labels=["Healthy", "Warning", "Critical"]).tolist()

    print(f"\n--- Random Forest Test Results ---")
    print(f"Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_test_pred, zero_division=0))

    # 2. Unsupervised Isolation Forest for Anomaly Detection
    healthy_train = train_df[train_df[TARGET_COLUMN] == "Healthy"][FEATURE_COLUMNS]
    healthy_train_scaled = scaler.transform(healthy_train)

    print("Training IsolationForest Anomaly Detector...")
    iso_forest = IsolationForest(
        n_estimators=120,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(healthy_train_scaled)

    # Save artifacts
    model_file = os.path.join(models_dir, "model.joblib")
    scaler_file = os.path.join(models_dir, "scaler.joblib")
    anomaly_file = os.path.join(models_dir, "isolation_forest.joblib")
    meta_file = os.path.join(models_dir, "model_meta.json")

    joblib.dump(rf_model, model_file)
    joblib.dump(scaler, scaler_file)
    joblib.dump(iso_forest, anomaly_file)

    feature_importances = dict(zip(FEATURE_COLUMNS, [float(x) for x in rf_model.feature_importances_]))

    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 150,
        "classes": list(rf_model.classes_),
        "features": FEATURE_COLUMNS,
        "feature_importances": feature_importances,
        "metrics": {
            "test_accuracy": float(acc),
            "healthy_f1": float(report.get("Healthy", {}).get("f1-score", 0)),
            "warning_f1": float(report.get("Warning", {}).get("f1-score", 0)),
            "critical_f1": float(report.get("Critical", {}).get("f1-score", 0)),
            "confusion_matrix": cm
        },
        "training_samples": len(train_df),
        "test_samples": len(test_df),
        "created_at": "2026-08-15T20:40:00Z"
    }

    with open(meta_file, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSuccessfully serialized all models to {models_dir}")

if __name__ == "__main__":
    train_pipeline()
