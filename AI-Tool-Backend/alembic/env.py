"""
Alembic environment script.

Deliberately does NOT import any SQLAlchemy ORM models or declare a
metadata target -- per rules.md, the Supabase REST client is the app's
only real data-access path, and this project isn't introducing a second
ORM as a competing source of truth. Migrations here are raw SQL only
(see alembic/versions/), so `target_metadata` stays None and
`--autogenerate` is not supported (nor needed) with this setup.
"""
import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.config import settings  # noqa: E402

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Single source of truth for the DB URL: same DATABASE_URL the app itself
# reads via pydantic-settings, not a duplicated value in alembic.ini.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

target_metadata = None


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
