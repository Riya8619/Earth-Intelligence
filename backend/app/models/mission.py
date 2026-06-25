from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
import enum

class MissionStatus(str, enum.Enum):
    planned = "planned"
    active = "active"
    completed = "completed"
    failed = "failed"

class Mission(Base):
    __tablename__ = "missions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(
        Enum(
            MissionStatus,
            values_callable=lambda obj: [e.value for e in obj]
        ),
        default=MissionStatus.planned.value
    )
    objective = Column(Text)
    region = Column(String)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    ai_briefing = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())