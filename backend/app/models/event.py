from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum

class SeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_type = Column(String)          # earthquake, wildfire, flood, etc.
    severity = Column(Enum(SeverityEnum), default=SeverityEnum.medium)
    latitude = Column(Float)
    longitude = Column(Float)
    location_name = Column(String)
    source = Column(String)              # NASA, USGS, OpenWeather, Manual
    source_url = Column(String)
    ai_analysis = Column(Text)
    occurred_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())