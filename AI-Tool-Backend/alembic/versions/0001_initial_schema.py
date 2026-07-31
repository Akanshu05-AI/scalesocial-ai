"""initial schema — creates all tables the codebase currently expects

Revision ID: 0001
Revises:
Create Date: 2026-07-20

Runs db/schema.sql verbatim rather than duplicating the same CREATE TABLE
statements here as a second copy -- schema.sql is the single source of
truth for what the tables look like; this migration just applies it.
"""
import os

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

SCHEMA_SQL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "db", "schema.sql")
)


def upgrade() -> None:
    with open(SCHEMA_SQL_PATH, "r") as f:
        op.execute(f.read())


def downgrade() -> None:
    # Reverse dependency order (children before parents they reference).
    op.execute("drop table if exists user_roles cascade;")
    op.execute("drop table if exists role_permissions cascade;")
    op.execute("drop table if exists permissions cascade;")
    op.execute("drop table if exists roles cascade;")
    op.execute("drop table if exists audit_logs cascade;")
    op.execute("drop table if exists scheduled_posts cascade;")
    op.execute("drop table if exists brand_voices cascade;")
    op.execute("drop table if exists user_settings cascade;")
    op.execute("drop table if exists users cascade;")
