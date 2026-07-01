from pydantic import BaseModel, field_validator
from typing import Optional, List, Any
from datetime import date, time, datetime


def _to_str(v):
    if v is None:
        return None
    if isinstance(v, date):
        return v.isoformat()
    if isinstance(v, time):
        return v.strftime("%H:%M")
    if isinstance(v, datetime):
        return v.isoformat()
    return str(v)


# Incident Detection Schemas
class IncidentDetectionBase(BaseModel):
    discovered_by: Optional[str] = None
    first_reporter: Optional[str] = None
    detection_time: Optional[str] = None
    occ_notification_time: Optional[str] = None
    occ_response_time: Optional[str] = None
    emergency_code: Optional[str] = None
    permit_number: Optional[str] = None


class IncidentDetectionCreate(IncidentDetectionBase):
    pass


class IncidentDetectionResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    incident_id: int
    discovered_by: Optional[str] = None
    first_reporter: Optional[str] = None
    emergency_code: Optional[str] = None
    permit_number: Optional[str] = None
    detection_time: Any = None
    occ_notification_time: Any = None
    occ_response_time: Any = None

    @field_validator('detection_time', 'occ_notification_time', 'occ_response_time', mode='before')
    @classmethod
    def _convert(cls, v): return _to_str(v)


# Incident Type Schemas
class IncidentTypeBase(BaseModel):
    type_name: str


class IncidentTypeCreate(IncidentTypeBase):
    pass


class IncidentTypeResponse(IncidentTypeBase):
    model_config = {"from_attributes": True}
    id: int
    incident_id: int


# Passenger Schemas
class PassengerBase(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    passenger_status: Optional[str] = None
    first_aid_given: Optional[str] = None
    ambulance_request_time: Optional[str] = None
    arrival_time: Optional[str] = None
    handover_time: Optional[str] = None
    departure_time: Optional[str] = None
    hospital_name: Optional[str] = None
    ambulance_reference: Optional[str] = None


class PassengerCreate(PassengerBase):
    pass


class PassengerResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    incident_id: int
    name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    passenger_status: Optional[str] = None
    first_aid_given: Optional[str] = None
    hospital_name: Optional[str] = None
    ambulance_reference: Optional[str] = None
    ambulance_request_time: Any = None
    arrival_time: Any = None
    handover_time: Any = None
    departure_time: Any = None

    @field_validator('ambulance_request_time', 'arrival_time', 'handover_time', 'departure_time', mode='before')
    @classmethod
    def _convert(cls, v): return _to_str(v)


# Train Operation Schemas
class TrainOperationBase(BaseModel):
    train_number: Optional[str] = None
    current_location: Optional[str] = None
    destination: Optional[str] = None
    operation_mode: Optional[str] = None
    rescue_train_number: Optional[str] = None
    rescue_start_time: Optional[str] = None
    rescue_end_time: Optional[str] = None
    handover_to_occ: Optional[str] = None
    return_to_service: Optional[str] = None


class TrainOperationCreate(TrainOperationBase):
    pass


class TrainOperationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    incident_id: int
    train_number: Optional[str] = None
    current_location: Optional[str] = None
    destination: Optional[str] = None
    operation_mode: Optional[str] = None
    rescue_train_number: Optional[str] = None
    rescue_start_time: Any = None
    rescue_end_time: Any = None
    handover_to_occ: Any = None
    return_to_service: Any = None

    @field_validator('rescue_start_time', 'rescue_end_time', 'handover_to_occ', 'return_to_service', mode='before')
    @classmethod
    def _convert(cls, v): return _to_str(v)


# Station Evacuation Schemas
class StationEvacuationBase(BaseModel):
    evacuation_order_time: Optional[str] = None
    evacuation_start_time: Optional[str] = None
    evacuation_completion_time: Optional[str] = None
    station_clear_notification_time: Optional[str] = None
    station_reopening_time: Optional[str] = None


class StationEvacuationCreate(StationEvacuationBase):
    pass


class StationEvacuationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    incident_id: int
    evacuation_order_time: Any = None
    evacuation_start_time: Any = None
    evacuation_completion_time: Any = None
    station_clear_notification_time: Any = None
    station_reopening_time: Any = None

    @field_validator('evacuation_order_time', 'evacuation_start_time', 'evacuation_completion_time', 'station_clear_notification_time', 'station_reopening_time', mode='before')
    @classmethod
    def _convert(cls, v): return _to_str(v)


# Staff Member Schemas
class StaffMemberBase(BaseModel):
    role: Optional[str] = None
    name: Optional[str] = None
    employee_id: Optional[str] = None
    digital_signature: Optional[str] = None


class StaffMemberCreate(StaffMemberBase):
    pass


class StaffMemberResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    incident_id: int
    role: Optional[str] = None
    name: Optional[str] = None
    employee_id: Optional[str] = None
    digital_signature: Optional[str] = None


# Impact Assessment Schemas
class ImpactAssessmentBase(BaseModel):
    incident_duration: Optional[int] = None
    response_duration: Optional[int] = None
    evacuation_duration: Optional[int] = None
    train_rescue_duration: Optional[int] = None
    train_delays: Optional[int] = None
    passengers_affected: Optional[int] = None
    equipment_affected: Optional[str] = None
    injuries: Optional[int] = None
    fatalities: Optional[int] = None
    cause: Optional[str] = None
    corrective_actions: Optional[str] = None
    lessons_learned: Optional[str] = None
    incident_closed: Optional[bool] = None


class ImpactAssessmentCreate(ImpactAssessmentBase):
    pass


class ImpactAssessmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    incident_id: int
    incident_duration: Optional[int] = None
    response_duration: Optional[int] = None
    evacuation_duration: Optional[int] = None
    train_rescue_duration: Optional[int] = None
    train_delays: Optional[int] = None
    passengers_affected: Optional[int] = None
    equipment_affected: Optional[str] = None
    injuries: Optional[int] = None
    fatalities: Optional[int] = None
    cause: Optional[str] = None
    corrective_actions: Optional[str] = None
    lessons_learned: Optional[str] = None
    incident_closed: Optional[bool] = None
    closed_at: Any = None

    @field_validator('closed_at', mode='before')
    @classmethod
    def _convert(cls, v): return _to_str(v)


# Main Incident Schemas
class IncidentBase(BaseModel):
    date: Optional[str] = None
    day: Optional[str] = None
    time: Optional[str] = None
    shift: Optional[str] = None
    station: Optional[str] = None
    location: Optional[str] = None
    platform: Optional[str] = None
    concourse: Optional[str] = None
    street_level: Optional[str] = None
    track: Optional[str] = None
    equipment_room: Optional[str] = None
    description: Optional[str] = None


class IncidentCreate(IncidentBase):
    detection: Optional[IncidentDetectionCreate] = None
    incident_types: Optional[List[IncidentTypeCreate]] = None
    passengers: Optional[List[PassengerCreate]] = None
    train_operations: Optional[TrainOperationCreate] = None
    evacuation: Optional[StationEvacuationCreate] = None
    staff: Optional[List[StaffMemberCreate]] = None
    impact: Optional[ImpactAssessmentCreate] = None


class IncidentUpdate(IncidentBase):
    detection: Optional[IncidentDetectionCreate] = None
    incident_types: Optional[List[IncidentTypeCreate]] = None
    passengers: Optional[List[PassengerCreate]] = None
    train_operations: Optional[TrainOperationCreate] = None
    evacuation: Optional[StationEvacuationCreate] = None
    staff: Optional[List[StaffMemberCreate]] = None
    impact: Optional[ImpactAssessmentCreate] = None


class IncidentListResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    incident_number: str
    shift: Optional[str] = None
    station: Optional[str] = None
    description: Optional[str] = None
    incident_types: Optional[List[IncidentTypeResponse]] = None
    date: Any = None
    time: Any = None
    created_at: Any = None

    @field_validator('date', 'time', 'created_at', mode='before')
    @classmethod
    def _convert(cls, v): return _to_str(v)


class IncidentDetailResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    incident_number: str
    day: Optional[str] = None
    shift: Optional[str] = None
    station: Optional[str] = None
    location: Optional[str] = None
    platform: Optional[str] = None
    concourse: Optional[str] = None
    street_level: Optional[str] = None
    track: Optional[str] = None
    equipment_room: Optional[str] = None
    description: Optional[str] = None
    detection: Optional[IncidentDetectionResponse] = None
    incident_types: Optional[List[IncidentTypeResponse]] = None
    passengers: Optional[List[PassengerResponse]] = None
    train_operations: Optional[TrainOperationResponse] = None
    evacuation: Optional[StationEvacuationResponse] = None
    staff: Optional[List[StaffMemberResponse]] = None
    impact: Optional[ImpactAssessmentResponse] = None
    date: Any = None
    time: Any = None
    created_at: Any = None
    updated_at: Any = None

    @field_validator('date', 'time', 'created_at', 'updated_at', mode='before')
    @classmethod
    def _convert(cls, v): return _to_str(v)


# KPI Schemas
class KPISummary(BaseModel):
    total_incidents: int
    open_incidents: int
    closed_incidents: int
    avg_response_time: Optional[float] = None
    avg_rescue_time: Optional[float] = None
    avg_evacuation_time: Optional[float] = None
    total_injuries: int
    total_fatalities: int
    incidents_by_type: List[dict]
    incidents_by_station: List[dict]
    incidents_by_shift: List[dict]
    monthly_trend: List[dict]
