"""Create mapping_presets table

Revision ID: 0003_create_mapping_presets
Revises: 0002_create_etl_activity_log
Create Date: 2026-09-02 04:12:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0003_create_mapping_presets'
down_revision: Union[str, None] = '0002_create_etl_activity_log'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'mapping_presets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cedant_code', sa.String(length=50), nullable=False),
        sa.Column('cob', sa.String(length=30), nullable=False),
        sa.Column('category', sa.String(length=20), nullable=False),
        sa.Column('preset_name', sa.String(length=100), nullable=False),
        sa.Column('mapping_json', sa.Text(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['app_users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mapping_presets_id'), 'mapping_presets', ['id'], unique=False)
    op.create_index(op.f('ix_mapping_presets_cedant_code'), 'mapping_presets', ['cedant_code'], unique=False)
    op.create_index(op.f('ix_mapping_presets_cob'), 'mapping_presets', ['cob'], unique=False)
    op.create_index(op.f('ix_mapping_presets_category'), 'mapping_presets', ['category'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_mapping_presets_category'), table_name='mapping_presets')
    op.drop_index(op.f('ix_mapping_presets_cob'), table_name='mapping_presets')
    op.drop_index(op.f('ix_mapping_presets_cedant_code'), table_name='mapping_presets')
    op.drop_index(op.f('ix_mapping_presets_id'), table_name='mapping_presets')
    op.drop_table('mapping_presets')
