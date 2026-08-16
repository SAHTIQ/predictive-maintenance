"""
Machine Management Routes
SPDX-License-Identifier: MIT
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas.machine import (
    MachineCreate, MachineUpdate, MachineResponse, MachineListResponse
)
from backend.app.schemas.sensor import SensorTrendPoint
from backend.app.services.machine_service import machine_service

router = APIRouter(prefix="/api/machines", tags=["Machines"])

@router.get("", response_model=MachineListResponse)
def list_machines(
    search: Optional[str] = Query(None, description="Search by ID, name, type or location"),
    active_only: Optional[bool] = Query(None, description="Filter by active status"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    total, items = machine_service.get_all(db, search=search, active_only=active_only, limit=limit, offset=offset)
    return MachineListResponse(total=total, items=items)

@router.get("/{machine_id}", response_model=MachineResponse)
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    mach = machine_service.get_by_id(db, machine_id)
    if not mach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with ID '{machine_id}' was not found."
        )
    return mach

@router.post("", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(payload: MachineCreate, db: Session = Depends(get_db)):
    try:
        return machine_service.create(db, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(machine_id: str, payload: MachineUpdate, db: Session = Depends(get_db)):
    updated = machine_service.update(db, machine_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with ID '{machine_id}' was not found."
        )
    return updated

@router.delete("/{machine_id}", status_code=status.HTTP_200_OK)
def deactivate_machine(machine_id: str, db: Session = Depends(get_db)):
    success = machine_service.deactivate(db, machine_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with ID '{machine_id}' was not found."
        )
    return {"message": f"Machine '{machine_id}' has been deactivated successfully."}

@router.get("/{machine_id}/trend", response_model=list[SensorTrendPoint])
def get_machine_sensor_trend(
    machine_id: str,
    limit: int = Query(50, ge=5, le=200),
    db: Session = Depends(get_db)
):
    mach = machine_service.get_by_id(db, machine_id)
    if not mach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with ID '{machine_id}' was not found."
        )
    return machine_service.get_trend(db, machine_id, limit=limit)
