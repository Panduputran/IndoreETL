"""Create etl_activity_log table

Revision ID: 0002_create_etl_activity_log
Revises: 0001_create_app_users
Create Date: 2026-09-02 04:11:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0002_create_etl_activity_log'
down_revision: Union[str, None] = '0001_create_app_users'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'etl_activity_log',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('cedant_code', sa.String(length=50), nullable=False),
        sa.Column('cedant_name', sa.String(length=150), nullable=True),
        sa.Column('cob', sa.String(length=30), nullable=False),
        sa.Column('category', sa.String(length=20), nullable=False),
        sa.Column('target_table', sa.String(length=100), nullable=False),
        sa.Column('period', sa.String(length=50), nullable=True),
        sa.Column('file_name', sa.String(length=255), nullable=True),
        sa.Column('file_size_bytes', sa.BigInteger(), nullable=True),
        sa.Column('rows_inserted', sa.Integer(), server_default='0', nullable=False),
        sa.Column('rows_deleted', sa.Integer(), server_default='0', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='success', nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('executed_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['app_users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_etl_activity_log_id'), 'etl_activity_log', ['id'], unique=False)
    op.create_index(op.f('ix_etl_activity_log_user_id'), 'etl_activity_log', ['user_id'], unique=False)
    op.create_index(op.f('ix_etl_activity_log_cedant_code'), 'etl_activity_log', ['cedant_code'], unique=False)
    op.create_index(op.f('ix_etl_activity_log_cob'), 'etl_activity_log', ['cob'], unique=False)
    op.create_index(op.f('ix_etl_activity_log_category'), 'etl_activity_log', ['category'], unique=False)
    op.create_index(op.f('ix_etl_activity_log_target_table'), 'etl_activity_log', ['target_table'], unique=False)
    op.create_index(op.f('ix_etl_activity_log_executed_at'), 'etl_activity_log', ['executed_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_etl_activity_log_executed_at'), table_name='etl_activity_log')
    op.drop_index(op.f('ix_etl_activity_log_target_table'), table_name='etl_activity_log')
    op.drop_index(op.f('ix_etl_activity_log_category'), table_name='etl_activity_log')
    op.drop_index(op.f('ix_etl_activity_log_cob'), table_name='etl_activity_log')
    op.drop_index(op.f('ix_etl_activity_log_cedant_code'), table_name='etl_activity_log')
    op.drop_index(op.f('ix_etl_activity_log_user_id'), table_name='etl_activity_log')
    op.drop_index(op.f('ix_etl_activity_log_id'), table_name='etl_activity_log')
    op.drop_table('etl_activity_log')
