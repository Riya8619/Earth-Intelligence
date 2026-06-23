from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base

class IntelligenceFeed(Base):
    __tablename__ = "intelligence_feed"
    id = Column(Integer, primary_key=True, index=True)
    headline = Column(String, nullable=False)
    summary = Column(Text)
    category = Column(String)            # climate, seismic, atmospheric, etc.
    confidence_score = Column(Float)     # 0.0 to 1.0
    source = Column(String)
    raw_data = Column(Text)
    ai_insight = Column(Text)
    tags = Column(String)                # comma-separated
    created_at = Column(DateTime(timezone=True), server_default=func.now())