from sqlalchemy import (
    Column, Integer, String, DateTime, Time, Text, Boolean, ForeignKey, Float, Date
)
from sqlalchemy.orm import relationship
from datetime import datetime, date, time

from .database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(20), unique=True, index=True, nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    day = Column(String(20))
    time = Column(Time, nullable=False, default=datetime.now().time)
    shift = Column(String(20))  # صباحية / مسائية / ليلية
    station = Column(String(100))
    location = Column(String(50))
    platform = Column(String(50))
    concourse = Column(String(50))
    street_level = Column(String(50))
    track = Column(String(50))
    equipment_room = Column(String(50))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    detection = relationship("IncidentDetection", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    incident_types = relationship("IncidentType", back_populates="incident", cascade="all, delete-orphan")
    passengers = relationship("Passenger", back_populates="incident", cascade="all, delete-orphan")
    train_operations = relationship("TrainOperation", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    evacuation = relationship("StationEvacuation", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    staff = relationship("StaffMember", back_populates="incident", cascade="all, delete-orphan")
    impact = relationship("ImpactAssessment", back_populates="incident", uselist=False, cascade="all, delete-orphan")


class IncidentDetection(Base):
    __tablename__ = "incident_detection"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    discovered_by = Column(String(100))
    first_reporter = Column(String(100))
    detection_time = Column(Time)
    occ_notification_time = Column(Time)
    occ_response_time = Column(Time)
    emergency_code = Column(String(50))
    permit_number = Column(String(50))

    incident = relationship("Incident", back_populates="detection")


class IncidentType(Base):
    __tablename__ = "incident_types"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    type_name = Column(String(100), nullable=False)

    incident = relationship("Incident", back_populates="incident_types")


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100))
    age = Column(Integer)
    phone = Column(String(20))
    emergency_contact = Column(String(100))
    passenger_status = Column(String(100))
    first_aid_given = Column(Text)
    ambulance_request_time = Column(Time)
    arrival_time = Column(Time)
    handover_time = Column(Time)
    departure_time = Column(Time)
    hospital_name = Column(String(200))
    ambulance_reference = Column(String(50))

    incident = relationship("Incident", back_populates="passengers")


class TrainOperation(Base):
    __tablename__ = "train_operations"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    train_number = Column(String(50))
    current_location = Column(String(100))
    destination = Column(String(100))
    operation_mode = Column(String(20))  # UTO / ATPM / RM / DM
    rescue_train_number = Column(String(50))
    rescue_start_time = Column(Time)
    rescue_end_time = Column(Time)
    handover_to_occ = Column(DateTime)
    return_to_service = Column(DateTime)

    incident = relationship("Incident", back_populates="train_operations")


class StationEvacuation(Base):
    __tablename__ = "station_evacuations"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    evacuation_order_time = Column(Time)
    evacuation_start_time = Column(Time)
    evacuation_completion_time = Column(Time)
    station_clear_notification_time = Column(Time)
    station_reopening_time = Column(Time)

    incident = relationship("Incident", back_populates="evacuation")


class StaffMember(Base):
    __tablename__ = "staff_members"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(100))
    name = Column(String(100))
    employee_id = Column(String(50))
    digital_signature = Column(Text)

    incident = relationship("Incident", back_populates="staff")


class ImpactAssessment(Base):
    __tablename__ = "impact_assessments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, unique=True)
    incident_duration = Column(Integer)
    response_duration = Column(Integer)
    evacuation_duration = Column(Integer)
    train_rescue_duration = Column(Integer)
    train_delays = Column(Integer)
    passengers_affected = Column(Integer)
    equipment_affected = Column(Text)
    injuries = Column(Integer)
    fatalities = Column(Integer)
    cause = Column(Text)
    corrective_actions = Column(Text)
    lessons_learned = Column(Text)
    incident_closed = Column(Boolean, default=False)
    closed_at = Column(DateTime)

    incident = relationship("Incident", back_populates="impact")
