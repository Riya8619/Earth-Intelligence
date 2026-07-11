from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import database base
from app.database import Base, DATABASE_URL

# Import all models so Alembic can detect them
from app.models.user import User
from app.models.event import Event
from app.models.mission import Mission
from app.models.intelligence import IntelligenceFeed

# Alembic Config object
config = context.config

# Override the sqlalchemy.url from alembic.ini with the app's real
# DATABASE_URL (already normalized to the psycopg v3 driver for Postgres
# by app.database) so migrations always target the database the app
# actually connects to, instead of the hardcoded local sqlite file.
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Configure logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata for autogeneration
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.
    """

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in online mode.
    """

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
