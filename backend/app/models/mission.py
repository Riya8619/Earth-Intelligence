from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
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
        default=MissionStatus.planned.value,
        nullable=False
    )

    objective = Column(Text)
    region = Column(String)

    # Default assignment until user-based assignments are implemented
    assigned_to = Column(
        String,
        nullable=False,
        default="Earth Intelligence AI"
    )

    ai_briefing = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )