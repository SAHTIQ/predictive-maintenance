"""
Machine Management Service
SPDX-License-Identifier: MIT

Handles machine CRUD, soft deletion/deactivation, telemetry retrieval, and health status computation.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import MachineModel, PredictionModel, SensorReadingModel
from backend.app.schemas.machine import MachineCreate, MachineUpdate, MachineResponse
from backend.app.schemas.sensor import SensorTrendPoint

class MachineService:
    @staticmethod
    def get_all(
        db: Session,
        search: Optional[str] = None,
        active_only: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0
    ) -> tuple[int, list[MachineResponse]]:
        query = db.query(MachineModel)

        if active_only is not None:
            query = query.filter(MachineModel.active == active_only)

        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                (MachineModel.machine_id.ilike(search_fmt)) |
                (MachineModel.name.ilike(search_fmt)) |
                (MachineModel.type.ilike(search_fmt)) |
                (MachineModel.location.ilike(search_fmt))
            )

        total = query.count()
        machines = query.order_by(MachineModel.machine_id).offset(offset).limit(limit).all()

        results = []
        for m in machines:
            # Fetch latest prediction for current health
            latest_pred = db.query(PredictionModel).filter(
                PredictionModel.machine_id == m.machine_id
            ).order_by(desc(PredictionModel.created_at)).first()

            resp = MachineResponse(
                id=m.id,
                machine_id=m.machine_id,
                name=m.name,
                type=m.type,
                location=m.location,
                manufacturer=m.manufacturer,
                model=m.model,
                operating_hours=m.operating_hours,
                description=m.description,
                active=m.active,
                created_at=m.created_at,
                updated_at=m.updated_at,
                current_health=latest_pred.overall_status if latest_pred else "Healthy",
                last_prediction_date=latest_pred.created_at if latest_pred else None
            )
            results.append(resp)

        return total, results

    @staticmethod
    def get_by_id(db: Session, machine_id: str) -> Optional[MachineResponse]:
        m = db.query(MachineModel).filter(MachineModel.machine_id == machine_id).first()
        if not m:
            return None

        latest_pred = db.query(PredictionModel).filter(
            PredictionModel.machine_id == m.machine_id
        ).order_by(desc(PredictionModel.created_at)).first()

        return MachineResponse(
            id=m.id,
            machine_id=m.machine_id,
            name=m.name,
            type=m.type,
            location=m.location,
            manufacturer=m.manufacturer,
            model=m.model,
            operating_hours=m.operating_hours,
            description=m.description,
            active=m.active,
            created_at=m.created_at,
            updated_at=m.updated_at,
            current_health=latest_pred.overall_status if latest_pred else "Healthy",
            last_prediction_date=latest_pred.created_at if latest_pred else None
        )

    @staticmethod
    def create(db: Session, payload: MachineCreate) -> MachineResponse:
        existing = db.query(MachineModel).filter(MachineModel.machine_id == payload.machine_id).first()
        if existing:
            raise ValueError(f"Machine with ID '{payload.machine_id}' already exists.")

        machine = MachineModel(
            machine_id=payload.machine_id,
            name=payload.name,
            type=payload.type,
            location=payload.location,
            manufacturer=payload.manufacturer,
            model=payload.model,
            operating_hours=payload.operating_hours,
            description=payload.description,
            active=payload.active,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(machine)
        db.commit()
        db.refresh(machine)
        return MachineService.get_by_id(db, machine.machine_id)

    @staticmethod
    def update(db: Session, machine_id: str, payload: MachineUpdate) -> Optional[MachineResponse]:
        m = db.query(MachineModel).filter(MachineModel.machine_id == machine_id).first()
        if not m:
            return None

        update_data = payload.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(m, key, val)
        m.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(m)
        return MachineService.get_by_id(db, m.machine_id)

    @staticmethod
    def deactivate(db: Session, machine_id: str) -> bool:
        m = db.query(MachineModel).filter(MachineModel.machine_id == machine_id).first()
        if not m:
            return False
        m.active = False
        m.updated_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def get_trend(db: Session, machine_id: str, limit: int = 50) -> list[SensorTrendPoint]:
        readings = db.query(SensorReadingModel).filter(
            SensorReadingModel.machine_id == machine_id
        ).order_by(desc(SensorReadingModel.recorded_at)).limit(limit).all()

        # Reverse to chronological order for charts
        readings.reverse()

        points = []
        for r in readings:
            points.append(SensorTrendPoint(
                recorded_at=r.recorded_at,
                temperature=r.temperature,
                vibration=r.vibration,
                pressure=r.pressure,
                voltage=r.voltage,
                current=r.current,
                rpm=r.rpm,
                operating_hours=r.operating_hours
            ))
        return points

machine_service = MachineService()
