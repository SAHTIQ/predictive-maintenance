"""
Sensor Reading Schemas
SPDX-License-Identifier: MIT
"""

from datetime import datetime
from pydantic import BaseModel, Field

class SensorReadingBase(BaseModel):
    machine_id: str
    temperature: float = Field(..., description="Operating temperature in °C", ge=-50.0, le=250.0)
    vibration: float = Field(..., description="Vibration velocity in mm/s", ge=0.0, le=100.0)
    pressure: float = Field(..., description="Hydraulic / ambient pressure in bar", ge=0.0, le=50.0)
    voltage: float = Field(..., description="Supply voltage in Volts", ge=0.0, le=1000.0)
    current: float = Field(..., description="Current consumption in Amperes", ge=0.0, le=500.0)
    rpm: float = Field(..., description="Rotational speed in RPM", ge=0.0, le=30000.0)
    operating_hours: float = Field(..., description="Cumulative operating runtime in hours", ge=0.0)

class SensorReadingCreate(SensorReadingBase):
    pass

class SensorReadingResponse(SensorReadingBase):
    id: int
    recorded_at: datetime

    class Config:
        from_attributes = True

class SensorTrendPoint(BaseModel):
    recorded_at: datetime
    temperature: float
    vibration: float
    pressure: float
    voltage: float
    current: float
    rpm: float
    operating_hours: float
    health_status: str | None = None
