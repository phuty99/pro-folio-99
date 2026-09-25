"""add profiles.extra_info

Revision ID: 0009
Revises: 0008
Create Date: 2026-09-25
"""

from alembic import op
import sqlalchemy as sa

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("profiles", sa.Column("extra_info", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("profiles", "extra_info")
