"""rename card difficulty to level (fresher/junior/middle/senior)

Revision ID: 0008
Revises: 0007
Create Date: 2026-08-27
"""

from alembic import op
import sqlalchemy as sa

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("study_cards", "difficulty", new_column_name="level", server_default="junior")
    op.execute("UPDATE study_cards SET level = 'junior' WHERE level NOT IN ('fresher', 'junior', 'middle', 'senior')")


def downgrade() -> None:
    op.alter_column("study_cards", "level", new_column_name="difficulty", server_default="medium")
