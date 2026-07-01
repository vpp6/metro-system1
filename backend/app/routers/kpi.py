from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/kpi", tags=["KPI"])


@router.get("/summary", response_model=schemas.KPISummary)
def get_kpi_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(models.Incident.id)).scalar() or 0

    closed = db.query(func.count(models.Incident.id)).join(
        models.ImpactAssessment
    ).filter(models.ImpactAssessment.incident_closed == True).scalar() or 0

    open_count = total - closed

    avg_response = db.query(func.avg(models.ImpactAssessment.response_duration)).scalar()
    avg_rescue = db.query(func.avg(models.ImpactAssessment.train_rescue_duration)).scalar()
    avg_evac = db.query(func.avg(models.ImpactAssessment.evacuation_duration)).scalar()

    total_injuries = db.query(func.sum(models.ImpactAssessment.injuries)).scalar() or 0
    total_fatalities = db.query(func.sum(models.ImpactAssessment.fatalities)).scalar() or 0

    # Incidents by type
    type_counts = db.query(
        models.IncidentType.type_name,
        func.count(models.IncidentType.id).label("count")
    ).group_by(models.IncidentType.type_name).order_by(
        func.count(models.IncidentType.id).desc()
    ).all()
    incidents_by_type = [{"name": t, "count": c} for t, c in type_counts]

    # Incidents by station
    station_counts = db.query(
        models.Incident.station,
        func.count(models.Incident.id).label("count")
    ).group_by(models.Incident.station).order_by(
        func.count(models.Incident.id).desc()
    ).all()
    incidents_by_station = [{"name": s or "غير محدد", "count": c} for s, c in station_counts]

    # Incidents by shift
    shift_counts = db.query(
        models.Incident.shift,
        func.count(models.Incident.id).label("count")
    ).group_by(models.Incident.shift).all()
    incidents_by_shift = [{"name": s or "غير محدد", "count": c} for s, c in shift_counts]

    # Monthly trend (last 12 months)
    twelve_months_ago = date.today() - timedelta(days=365)
    monthly = db.query(
        extract("year", models.Incident.date).label("year"),
        extract("month", models.Incident.date).label("month"),
        func.count(models.Incident.id).label("count")
    ).filter(
        models.Incident.date >= twelve_months_ago
    ).group_by(
        extract("year", models.Incident.date),
        extract("month", models.Incident.date),
    ).order_by(
        extract("year", models.Incident.date),
        extract("month", models.Incident.date),
    ).all()

    months_ar = {
        1: "يناير", 2: "فبراير", 3: "مارس", 4: "إبريل",
        5: "مايو", 6: "يونيو", 7: "يوليو", 8: "أغسطس",
        9: "سبتمبر", 10: "أكتوبر", 11: "نوفمبر", 12: "ديسمبر"
    }
    monthly_trend = [
        {"month": f"{months_ar[int(m)]} {int(y)}", "count": c}
        for y, m, c in monthly
    ]

    return schemas.KPISummary(
        total_incidents=total,
        open_incidents=open_count,
        closed_incidents=closed,
        avg_response_time=float(avg_response) if avg_response else None,
        avg_rescue_time=float(avg_rescue) if avg_rescue else None,
        avg_evacuation_time=float(avg_evac) if avg_evac else None,
        total_injuries=total_injuries,
        total_fatalities=total_fatalities,
        incidents_by_type=incidents_by_type,
        incidents_by_station=incidents_by_station,
        incidents_by_shift=incidents_by_shift,
        monthly_trend=monthly_trend,
    )
