"""
Machine Pydantic Schemas
SPDX-License-Identifier: MIT
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MachineBase(BaseModel):
    machine_id: str = Field(..., description="Unique machine identifier, e.g. M-001", min_length=2, max_length=50)
    name: str = Field(..., description="Human readable machine name", min_length=2, max_length=150)
    type: str = Field(..., description="Machine type / category", min_length=2, max_length=100)
    location: str = Field(..., description="Factory / Facility location", min_length=2, max_length=150)
    manufacturer: Optional[str] = Field(None, max_length=150)
    model: Optional[str] = Field(None, max_length=100)
    operating_hours: float = Field(0.0, ge=0.0)
    description: Optional[str] = None
    active: bool = True

class MachineCreate(MachineBase):
    pass

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    operating_hours: Optional[float] = None
    description: Optional[str] = None
    active: Optional[bool] = None

class MachineResponse(MachineBase):
    id: int
    created_at: datetime
    updated_at: datetime
    current_health: Optional[str] = "Healthy"
    last_prediction_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class MachineListResponse(BaseModel):
    total: int
    items: list[MachineResponse]
