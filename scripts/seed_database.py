"""
Database Seeding Script for Predictive Maintenance Platform
SPDX-License-Identifier: MIT

Populates database with 50 industrial machines, initial sensor telemetry, and historical predictions.
"""

import os
import sys
import pandas as pd
from datetime import datetime, timedelta

# Ensure root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal, init_db, MachineModel, SensorReadingModel, PredictionModel
from backend.app.services.prediction_service import prediction_service
from backend.app.schemas.prediction import PredictionRequest
from backend.app.utils.logger import logger

MACHINE_SPECS = [
    {"type": "CNC Milling Machine", "manufacturer": "Haas Automation", "model": "VF-4SS"},
    {"type": "Induction Motor Drive", "manufacturer": "Siemens", "model": "1LE1001-1DB23"},
    {"type": "Hydraulic Pump Unit", "manufacturer": "Bosch Rexroth", "model": "A10VSO28"},
    {"type": "Centrifugal Gas Compressor", "manufacturer": "Atlas Copco", "model": "GA-75 VSD"},
    {"type": "6-Axis Articulated Robot", "manufacturer": "FANUC", "model": "M-20iD/25"},
    {"type": "Industrial Extruder", "manufacturer": "Coperion", "model": "ZSK 26 Mc18"},
    {"type": "Turbine Generator Set", "manufacturer": "GE Power", "model": "TM2500"}
]

LOCATIONS = [
    "Plant 1 - Machining Bay A",
    "Plant 1 - Assembly Line 2",
    "Plant 2 - Compressor Room",
    "Plant 2 - Robotic Cell 4",
    "Plant 3 - Hydraulic Power House",
    "Plant 3 - Extrusion Facility"
]

def seed():
    print("Initializing Database tables...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_count = db.query(MachineModel).count()
        if existing_count >= 50:
            print(f"Database already contains {existing_count} machines. Skipping seed.")
            return

        print(f"Seeding 50 industrial machines...")
        dataset_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "ml", "data", "predictive_maintenance_dataset.csv"
        )
        df = None
        if os.path.exists(dataset_path):
            df = pd.read_csv(dataset_path)

        for i in range(1, 51):
            machine_id = f"M-{i:03d}"
            spec = MACHINE_SPECS[(i - 1) % len(MACHINE_SPECS)]
            loc = LOCATIONS[(i - 1) % len(LOCATIONS)]
            install_dt = datetime.utcnow() - timedelta(days=int(i * 24 + 180))
            op_hours = float(1200.0 + (i * 145.5))

            mach = MachineModel(
                machine_id=machine_id,
                name=f"{spec['type']} #{i:02d}",
                type=spec["type"],
                location=loc,
                manufacturer=spec["manufacturer"],
                model=spec["model"],
                installation_date=install_dt,
                operating_hours=op_hours,
                description=f"High-criticality {spec['type']} operational in {loc}.",
                active=(i != 48 and i != 50), # 2 inactive machines for demo
                created_at=install_dt,
                updated_at=datetime.utcnow()
            )
            db.add(mach)
        db.commit()
        print("Inserted 50 machines.")

        # Seed telemetry and sample predictions from dataset
        if df is not None:
            print("Seeding telemetry readings and running baseline predictions...")
            # For each machine, take the latest 10 timesteps from the dataset
            for i in range(1, 51):
                machine_id = f"M-{i:03d}"
                mach_df = df[df["machine_id"] == machine_id].sort_values("timestep")
                if mach_df.empty:
                    continue

                # Take the last 15 observations for each machine
                recent_rows = mach_df.tail(15)
                base_time = datetime.utcnow() - timedelta(hours=len(recent_rows)*4)

                for step_idx, (_, row) in enumerate(recent_rows.iterrows()):
                    reading_time = base_time + timedelta(hours=step_idx * 4)
                    
                    # Store reading
                    reading = SensorReadingModel(
                        machine_id=machine_id,
                        temperature=float(row["temperature"]),
                        vibration=float(row["vibration"]),
                        pressure=float(row["pressure"]),
                        voltage=float(row["voltage"]),
                        current=float(row["current"]),
                        rpm=float(row["rpm"]),
                        operating_hours=float(row["operating_hours"]),
                        recorded_at=reading_time
                    )
                    db.add(reading)

                # Run prediction for the final 3 readings to build prediction history
                latest_3 = mach_df.tail(3)
                for _, row in latest_3.iterrows():
                    req = PredictionRequest(
                        machine_id=machine_id,
                        temperature=float(row["temperature"]),
                        vibration=float(row["vibration"]),
                        pressure=float(row["pressure"]),
                        voltage=float(row["voltage"]),
                        current=float(row["current"]),
                        rpm=float(row["rpm"]),
                        operating_hours=float(row["operating_hours"])
                    )
                    prediction_service.run_prediction(req, db, persist=True)

            db.commit()
            print("Successfully populated telemetry readings and prediction history.")

    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
