from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.mission import Mission,MissionStatus
from app.services.event_service import get_operational_events
from app.services.mission_service import build_operational_missions
from app.services.ai_service import generate_fallback_briefing
from app.services.event_service import gather_environmental_data
from app.services.risk_service import calculate_earth_health_score

router = APIRouter(prefix="/missions", tags=["Missions"])

class MissionBase(BaseModel):
    title: str
    description: str | None = None
    status: MissionStatus = MissionStatus.planned
    objective: str | None = None
    region: str | None = None
    assigned_to: int | None = None
    ai_briefing: str | None = None

class MissionCreate(MissionBase):
    pass

class MissionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: MissionStatus | None = None
    objective: str | None = None
    region: str | None = None
    assigned_to: int | None = None
    ai_briefing: str | None = None

@router.get("/")
def get_missions(db: Session = Depends(get_db)):
    events = get_operational_events(db, "72h", min_count=10)
    dynamic_missions = build_operational_missions(events)
    saved_missions = db.query(Mission).order_by(Mission.created_at.desc()).all()
    saved_payload = [
        {
            "id": mission.id,
            "name": mission.title,
            "title": mission.title,
            "status": mission.status.value.title() if hasattr(mission.status, "value") else str(mission.status).title(),
            "objective": mission.objective or mission.description or "User-defined Earth intelligence mission.",
            "description": mission.description,
            "region": mission.region or "User-defined sector",
            "progress": 72,
            "activeEvents": 0,
            "active_events": 0,
            "lastUpdate": mission.updated_at.isoformat() + "Z" if mission.updated_at else None,
            "health": 88,
            "linkedEvents": [],
        }
        for mission in saved_missions
    ]
    return {"missions": dynamic_missions + saved_payload}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_mission(payload: MissionCreate, db: Session = Depends(get_db)):

    environment = gather_environmental_data(db, "72h")
    score = calculate_earth_health_score(environment)

    briefing = generate_fallback_briefing(
        environment=environment,
        earth_health_score=score,
        query=payload.objective or payload.title
    )

    mission = Mission(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        objective=payload.objective,
        region=payload.region,
        assigned_to=payload.assigned_to,
        ai_briefing=briefing["summary"]
    )

    db.add(mission)
    db.commit()
    db.refresh(mission)

    return mission

@router.put("/{mission_id}")
def update_mission(mission_id: int, payload: MissionUpdate, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(mission, field, value)
    db.commit()
    db.refresh(mission)
    return mission

@router.delete("/{mission_id}", status_code=status.HTTP_200_OK)
def delete_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mission not found")
    db.delete(mission)
    db.commit()
    return {"detail": "Mission deleted successfully"}

@router.get("/fix-status")
def fix_status(db: Session = Depends(get_db)):
    missions = db.query(Mission).all()

    for mission in missions:
        if str(mission.status) not in [
            "planned",
            "active",
            "completed",
            "failed"
        ]:
            mission.status = MissionStatus.planned

    db.commit()

    return {"message": "fixed"}