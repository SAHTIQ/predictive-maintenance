"""
Database Engine & Session Management with Seamless Fallback
SPDX-License-Identifier: MIT
"""

import json
from datetime import datetime
from typing import Generator
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from sqlalchemy.exc import OperationalError

from backend.app.config import settings
from backend.app.utils.logger import logger

Base = declarative_base()

class MachineModel(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    type = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    manufacturer = Column(String(150), nullable=True)
    model = Column(String(100), nullable=True)
    installation_date = Column(DateTime, default=datetime.utcnow)
    operating_hours = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sensor_readings = relationship("SensorReadingModel", back_populates="machine", cascade="all, delete-orphan")
    predictions = relationship("PredictionModel", back_populates="machine", cascade="all, delete-orphan")


class SensorReadingModel(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.machine_id", ondelete="CASCADE"), index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    vibration = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    voltage = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    rpm = Column(Float, nullable=False)
    operating_hours = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    machine = relationship("MachineModel", back_populates="sensor_readings")


class PredictionModel(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.machine_id", ondelete="CASCADE"), index=True, nullable=False)
    ml_prediction = Column(String(50), nullable=False)
    ml_confidence = Column(Float, nullable=False)
    rule_prediction = Column(String(50), nullable=False)
    rule_violations = Column(JSON, default=list)
    anomaly_prediction = Column(String(50), nullable=False)
    anomaly_score = Column(Float, nullable=False)
    overall_status = Column(String(50), nullable=False, index=True)
    risk_level = Column(String(50), nullable=False)
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    input_features = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    machine = relationship("MachineModel", back_populates="predictions")


def create_db_engine():
    target_url = settings.DATABASE_URL
    try:
        if target_url.startswith("postgresql"):
            logger.info(f"Connecting to PostgreSQL database at: {target_url.split('@')[-1] if '@' in target_url else 'specified host'}")
            engine = create_engine(target_url, pool_pre_ping=True, pool_size=10, max_overflow=20)
            # Test connection
            with engine.connect() as conn:
                pass
            logger.info("Successfully connected to PostgreSQL.")
            return engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection unavailable ({e}). Falling back to local SQLite database.")

    # SQLite fallback
    fallback_url = "sqlite:///./predictive_maintenance_local.db"
    logger.info(f"Using local SQLite database: {fallback_url}")
    return create_engine(fallback_url, connect_args={"check_same_thread": False})


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initializes database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
