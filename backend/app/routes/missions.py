from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.mission import Mission
from app.services.event_service import get_operational_events
from app.services.mission_service import build_operational_missions

router = APIRouter(prefix="/missions", tags=["Missions"])

class MissionBase(BaseModel):
    title: str
    description: str | None = None
    status: str | None = None
    objective: str | None = None
    region: str | None = None
    assigned_to: int | None = None
    ai_briefing: str | None = None

class MissionCreate(MissionBase):
    pass

class MissionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
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
    mission = Mission(**payload.model_dump())
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
