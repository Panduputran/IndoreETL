"""Add mapping_config and technical_log to etl_activity_log

Revision ID: 0005_add_mapping_config_to_etl_log
Revises: 0004_update_app_users_sso
Create Date: 2026-09-02 15:16:30.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0005_add_mapping_config_to_etl_log'
down_revision: Union[str, None] = '0004_update_app_users_sso'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('etl_activity_log', sa.Column('mapping_config', sa.Text(), nullable=True))
    op.add_column('etl_activity_log', sa.Column('technical_log', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('etl_activity_log', 'technical_log')
    op.drop_column('etl_activity_log', 'mapping_config')
