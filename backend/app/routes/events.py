from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.services.event_service import get_operational_events

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/")
def get_events(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    events = get_operational_events(db, "72h", min_count=10)
    return {"events": events[skip : skip + limit]}

@router.get("/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    return db.query(Event).filter(Event.id == event_id).first()
