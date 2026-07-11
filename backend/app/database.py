from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

# PostgreSQL
if DATABASE_URL.startswith("postgresql"):
    # requirements.txt installs psycopg (v3), not psycopg2, but SQLAlchemy's
    # default dialect for a bare "postgresql://" URL is psycopg2. Force the
    # psycopg (v3) driver so the app can actually connect (e.g. to Neon on
    # Render) without requiring psycopg2 to be installed.
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(DATABASE_URL)

# SQLite
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
