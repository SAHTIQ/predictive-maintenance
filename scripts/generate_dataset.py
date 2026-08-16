"""
Dataset Generator for Industrial Predictive Maintenance & Machine Health
SPDX-License-Identifier: MIT

Generates 5,000 chronological observations across 50 industrial machines
(100 time-step observations per machine). Incorporates physical wear dynamics:
bearing degradation, thermal accumulation, pressure fluctuation, and electrical anomalies.
"""

import os
import numpy as np
import pandas as pd

def generate_industrial_dataset(num_machines=50, timesteps_per_machine=100, seed=42):
    np.random.seed(seed)
    records = []

    machine_types = [
        "CNC Lathe",
        "Induction Motor",
        "Hydraulic Pump",
        "Centrifugal Compressor",
        "Industrial Robot"
    ]

    for m_idx in range(1, num_machines + 1):
        machine_id = f"M-{m_idx:03d}"
        m_type = machine_types[(m_idx - 1) % len(machine_types)]
        
        # Baseline operating characteristics
        base_temp = np.random.uniform(55.0, 68.0)
        base_vib = np.random.uniform(1.2, 2.5)
        base_press = np.random.uniform(4.5, 5.5)
        base_volt = np.random.uniform(390.0, 410.0)
        base_curr = np.random.uniform(12.0, 18.0)
        base_rpm = np.random.uniform(1450.0, 1520.0)
        start_hours = np.random.uniform(500.0, 8000.0)

        # Distribute failure modes across machines with varying degradation onsets
        # 0: Healthy lifecycle
        # 1: Bearing wear
        # 2: Thermal runaway
        # 3: Electrical fault
        failure_mode = np.random.choice([0, 1, 2, 3], p=[0.25, 0.30, 0.25, 0.20])
        degradation_onset = np.random.randint(15, 65) if failure_mode > 0 else 101

        for step in range(1, timesteps_per_machine + 1):
            op_hours = start_hours + (step * 8.5)
            wear = 0.0

            if step >= degradation_onset:
                progress = (step - degradation_onset) / (timesteps_per_machine - degradation_onset + 1e-5)
                wear = np.power(progress, 1.3)

            # Telemetry synthesis
            temp = base_temp + np.random.normal(0, 1.2)
            vib = base_vib + np.random.normal(0, 0.12)
            press = base_press + np.random.normal(0, 0.10)
            volt = base_volt + np.random.normal(0, 2.0)
            curr = base_curr + np.random.normal(0, 0.35)
            rpm = base_rpm + np.random.normal(0, 8.0)

            if failure_mode == 1 and wear > 0:
                vib += wear * 6.5
                temp += wear * 28.0
                rpm -= wear * 120.0
                curr += wear * 6.5
            elif failure_mode == 2 and wear > 0:
                temp += wear * 38.0
                press += wear * 3.2
                vib += wear * 2.8
                curr += wear * 4.0
            elif failure_mode == 3 and wear > 0:
                curr += wear * 15.0
                volt -= wear * 40.0
                rpm -= wear * 250.0
                vib += wear * 3.5
                temp += wear * 18.0

            # Deterministic domain health status from physical readings
            if (
                temp >= 90.0 or
                vib >= 6.0 or
                curr >= 28.0 or
                volt <= 365.0 or
                (temp >= 84.0 and vib >= 4.8) or
                (curr >= 24.0 and volt <= 375.0)
            ):
                status = "Critical"
            elif (
                temp >= 78.0 or
                vib >= 3.8 or
                curr >= 21.0 or
                volt <= 380.0 or
                press <= 3.0 or
                press >= 6.8
            ):
                status = "Warning"
            else:
                status = "Healthy"

            records.append({
                "machine_id": machine_id,
                "machine_type": m_type,
                "timestep": step,
                "temperature": round(float(temp), 2),
                "vibration": round(float(vib), 3),
                "pressure": round(float(press), 2),
                "voltage": round(float(volt), 2),
                "current": round(float(curr), 2),
                "rpm": round(float(rpm), 1),
                "operating_hours": round(float(op_hours), 1),
                "health_status": status
            })

    df = pd.DataFrame(records)
    return df

def main():
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "data")
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "predictive_maintenance_dataset.csv")

    print("Generating industrial dataset (50 machines x 100 observations = 5000 rows)...")
    df = generate_industrial_dataset()
    df.to_csv(csv_path, index=False)
    print(f"Dataset successfully saved to: {csv_path}")
    print(f"Summary of classes:\n{df['health_status'].value_counts()}")

if __name__ == "__main__":
    main()
