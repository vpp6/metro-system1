from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date, datetime, time

from ..database import get_db
from .. import models, schemas
from ..pdf_generator import generate_incident_report

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

TIME_FIELDS = {
    "detection": ["detection_time", "occ_notification_time", "occ_response_time"],
    "passengers": ["ambulance_request_time", "arrival_time", "handover_time", "departure_time"],
    "train_operations": ["rescue_start_time", "rescue_end_time"],
    "evacuation": ["evacuation_order_time", "evacuation_start_time", "evacuation_completion_time",
                   "station_clear_notification_time", "station_reopening_time"],
}

def _to_time(val):
    if isinstance(val, str) and val:
        parts = val.split(":")
        return time(int(parts[0]), int(parts[1]), int(parts[2]) if len(parts) > 2 else 0)
    return val

def _convert_times(data: dict, fields: list) -> dict:
    for f in fields:
        if f in data:
            data[f] = _to_time(data[f])
    return data


def generate_incident_number(db: Session) -> str:
    today = date.today()
    count = db.query(func.count(models.Incident.id)).filter(
        func.date(models.Incident.created_at) == today
    ).scalar()
    return f"INC-{today.strftime('%Y%m%d')}-{count + 1:04d}"


@router.post("", response_model=schemas.IncidentDetailResponse)
def create_incident(data: schemas.IncidentCreate, db: Session = Depends(get_db)):
    inc_data = data.model_dump(exclude_unset=True)
    nested = ["detection", "incident_types", "passengers", "train_operations", "evacuation", "staff", "impact"]

    main_data = {k: v for k, v in inc_data.items() if k not in nested}

    if main_data.get("date") and isinstance(main_data["date"], str):
        main_data["date"] = date.fromisoformat(main_data["date"])
    if main_data.get("time") and isinstance(main_data["time"], str):
        parts = main_data["time"].split(":")
        main_data["time"] = time(int(parts[0]), int(parts[1]), int(parts[2]) if len(parts) > 2 else 0)

    incident = models.Incident(**main_data)
    incident.incident_number = generate_incident_number(db)

    if data.detection:
        det = data.detection.model_dump(exclude_unset=True)
        _convert_times(det, TIME_FIELDS["detection"])
        incident.detection = models.IncidentDetection(**det)

    if data.incident_types:
        for t in data.incident_types:
            incident.incident_types.append(models.IncidentType(**t.model_dump()))

    if data.passengers:
        for p in data.passengers:
            pdata = p.model_dump()
            _convert_times(pdata, TIME_FIELDS["passengers"])
            incident.passengers.append(models.Passenger(**pdata))

    if data.train_operations:
        tdata = data.train_operations.model_dump()
        _convert_times(tdata, TIME_FIELDS["train_operations"])
        incident.train_operations = models.TrainOperation(**tdata)

    if data.evacuation:
        edata = data.evacuation.model_dump()
        _convert_times(edata, TIME_FIELDS["evacuation"])
        incident.evacuation = models.StationEvacuation(**edata)

    if data.staff:
        for s in data.staff:
            incident.staff.append(models.StaffMember(**s.model_dump()))

    if data.impact:
        incident.impact = models.ImpactAssessment(**data.impact.model_dump())

    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("", response_model=List[schemas.IncidentListResponse])
def list_incidents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    station: Optional[str] = None,
    shift: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    incident_type: Optional[str] = None,
    closed: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Incident)

    if station:
        query = query.filter(models.Incident.station.ilike(f"%{station}%"))
    if shift:
        query = query.filter(models.Incident.shift == shift)
    if date_from:
        query = query.filter(models.Incident.date >= date.fromisoformat(date_from))
    if date_to:
        query = query.filter(models.Incident.date <= date.fromisoformat(date_to))
    if incident_type:
        query = query.join(models.IncidentType).filter(models.IncidentType.type_name.ilike(f"%{incident_type}%"))
    if closed is not None:
        query = query.join(models.ImpactAssessment).filter(models.ImpactAssessment.incident_closed == closed)

    query = query.order_by(models.Incident.created_at.desc())
    incidents = query.offset(skip).limit(limit).all()
    return incidents


@router.get("/{incident_id}", response_model=schemas.IncidentDetailResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")
    return incident


@router.put("/{incident_id}", response_model=schemas.IncidentDetailResponse)
def update_incident(incident_id: int, data: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")

    inc_data = data.model_dump(exclude_unset=True)
    nested = ["detection", "incident_types", "passengers", "train_operations", "evacuation", "staff", "impact"]
    main_data = {k: v for k, v in inc_data.items() if k not in nested}

    if "date" in main_data and isinstance(main_data["date"], str):
        main_data["date"] = date.fromisoformat(main_data["date"])
    if "time" in main_data and isinstance(main_data["time"], str):
        parts = main_data["time"].split(":")
        main_data["time"] = time(int(parts[0]), int(parts[1]), int(parts[2]) if len(parts) > 2 else 0)

    for key, value in main_data.items():
        setattr(incident, key, value)

    # Update nested relationships
    if data.detection is not None:
        det = data.detection.model_dump(exclude_unset=True)
        _convert_times(det, TIME_FIELDS["detection"])
        if incident.detection:
            for k, v in det.items():
                setattr(incident.detection, k, v)
        else:
            incident.detection = models.IncidentDetection(**det)

    if data.incident_types is not None:
        incident.incident_types.clear()
        for t in data.incident_types:
            incident.incident_types.append(models.IncidentType(**t.model_dump()))

    if data.passengers is not None:
        incident.passengers.clear()
        for p in data.passengers:
            pdata = p.model_dump()
            _convert_times(pdata, TIME_FIELDS["passengers"])
            incident.passengers.append(models.Passenger(**pdata))

    if data.train_operations is not None:
        tdata = data.train_operations.model_dump(exclude_unset=True)
        _convert_times(tdata, TIME_FIELDS["train_operations"])
        if incident.train_operations:
            for k, v in tdata.items():
                setattr(incident.train_operations, k, v)
        else:
            incident.train_operations = models.TrainOperation(**tdata)

    if data.evacuation is not None:
        edata = data.evacuation.model_dump(exclude_unset=True)
        _convert_times(edata, TIME_FIELDS["evacuation"])
        if incident.evacuation:
            for k, v in edata.items():
                setattr(incident.evacuation, k, v)
        else:
            incident.evacuation = models.StationEvacuation(**edata)

    if data.staff is not None:
        incident.staff.clear()
        for s in data.staff:
            incident.staff.append(models.StaffMember(**s.model_dump()))

    if data.impact is not None:
        if incident.impact:
            for k, v in data.impact.model_dump(exclude_unset=True).items():
                setattr(incident.impact, k, v)
            if data.impact.incident_closed:
                incident.impact.closed_at = datetime.utcnow()
        else:
            impact = models.ImpactAssessment(**data.impact.model_dump())
            if impact.incident_closed:
                impact.closed_at = datetime.utcnow()
            incident.impact = impact

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")
    db.delete(incident)
    db.commit()
    return {"message": "تم حذف الحادث بنجاح"}


@router.get("/{incident_id}/report")
def download_report(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="الحادث غير موجود")

    incident_dict = {
        "id": incident.id,
        "incident_number": incident.incident_number,
        "date": str(incident.date) if incident.date else "",
        "day": incident.day,
        "time": incident.time.strftime("%H:%M") if incident.time else "",
        "shift": incident.shift,
        "station": incident.station,
        "location": incident.location,
        "platform": incident.platform,
        "concourse": incident.concourse,
        "street_level": incident.street_level,
        "track": incident.track,
        "equipment_room": incident.equipment_room,
        "description": incident.description or "",
        "detection": {
            "discovered_by": incident.detection.discovered_by if incident.detection else "",
            "first_reporter": incident.detection.first_reporter if incident.detection else "",
            "detection_time": incident.detection.detection_time.strftime("%H:%M") if incident.detection and incident.detection.detection_time else "",
            "occ_notification_time": incident.detection.occ_notification_time.strftime("%H:%M") if incident.detection and incident.detection.occ_notification_time else "",
            "occ_response_time": incident.detection.occ_response_time.strftime("%H:%M") if incident.detection and incident.detection.occ_response_time else "",
            "emergency_code": incident.detection.emergency_code if incident.detection else "",
            "permit_number": incident.detection.permit_number if incident.detection else "",
        } if incident.detection else {},
        "incident_types": [{"type_name": t.type_name} for t in incident.incident_types] if incident.incident_types else [],
        "passengers": [
            {
                "name": p.name,
                "age": p.age,
                "phone": p.phone,
                "emergency_contact": p.emergency_contact,
                "passenger_status": p.passenger_status,
                "first_aid_given": p.first_aid_given,
                "ambulance_request_time": p.ambulance_request_time.strftime("%H:%M") if p.ambulance_request_time else "",
                "arrival_time": p.arrival_time.strftime("%H:%M") if p.arrival_time else "",
                "handover_time": p.handover_time.strftime("%H:%M") if p.handover_time else "",
                "departure_time": p.departure_time.strftime("%H:%M") if p.departure_time else "",
                "hospital_name": p.hospital_name,
                "ambulance_reference": p.ambulance_reference,
            }
            for p in incident.passengers
        ] if incident.passengers else [],
        "train_operations": {
            "train_number": incident.train_operations.train_number if incident.train_operations else "",
            "current_location": incident.train_operations.current_location if incident.train_operations else "",
            "destination": incident.train_operations.destination if incident.train_operations else "",
            "operation_mode": incident.train_operations.operation_mode if incident.train_operations else "",
            "rescue_train_number": incident.train_operations.rescue_train_number if incident.train_operations else "",
            "rescue_start_time": incident.train_operations.rescue_start_time.strftime("%H:%M") if incident.train_operations and incident.train_operations.rescue_start_time else "",
            "rescue_end_time": incident.train_operations.rescue_end_time.strftime("%H:%M") if incident.train_operations and incident.train_operations.rescue_end_time else "",
        } if incident.train_operations else {},
        "evacuation": {
            "evacuation_order_time": incident.evacuation.evacuation_order_time.strftime("%H:%M") if incident.evacuation and incident.evacuation.evacuation_order_time else "",
            "evacuation_start_time": incident.evacuation.evacuation_start_time.strftime("%H:%M") if incident.evacuation and incident.evacuation.evacuation_start_time else "",
            "evacuation_completion_time": incident.evacuation.evacuation_completion_time.strftime("%H:%M") if incident.evacuation and incident.evacuation.evacuation_completion_time else "",
            "station_clear_notification_time": incident.evacuation.station_clear_notification_time.strftime("%H:%M") if incident.evacuation and incident.evacuation.station_clear_notification_time else "",
            "station_reopening_time": incident.evacuation.station_reopening_time.strftime("%H:%M") if incident.evacuation and incident.evacuation.station_reopening_time else "",
        } if incident.evacuation else {},
        "staff": [
            {
                "role": s.role,
                "name": s.name,
                "employee_id": s.employee_id,
                "digital_signature": s.digital_signature,
            }
            for s in incident.staff
        ] if incident.staff else [],
        "impact": {
            "incident_duration": incident.impact.incident_duration if incident.impact else None,
            "response_duration": incident.impact.response_duration if incident.impact else None,
            "evacuation_duration": incident.impact.evacuation_duration if incident.impact else None,
            "train_rescue_duration": incident.impact.train_rescue_duration if incident.impact else None,
            "train_delays": incident.impact.train_delays if incident.impact else None,
            "passengers_affected": incident.impact.passengers_affected if incident.impact else None,
            "equipment_affected": incident.impact.equipment_affected if incident.impact else "",
            "injuries": incident.impact.injuries if incident.impact else 0,
            "fatalities": incident.impact.fatalities if incident.impact else 0,
            "cause": incident.impact.cause if incident.impact else "",
            "corrective_actions": incident.impact.corrective_actions if incident.impact else "",
            "lessons_learned": incident.impact.lessons_learned if incident.impact else "",
            "incident_closed": incident.impact.incident_closed if incident.impact else False,
        } if incident.impact else {},
    }

    pdf_bytes = generate_incident_report(incident_dict)

    from fastapi.responses import Response
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="incident_{incident.incident_number}.pdf"'
        },
    )
