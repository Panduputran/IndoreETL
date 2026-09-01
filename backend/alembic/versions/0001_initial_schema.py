"""Initial schema: app_users, etl_activity_log, mapping_presets

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-02 03:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Tabel app_users
    op.create_table(
        'app_users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('role', sa.String(length=20), server_default='operator', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_app_users_id'), 'app_users', ['id'], unique=False)
    op.create_index(op.f('ix_app_users_username'), 'app_users', ['username'], unique=True)
    op.create_index(op.f('ix_app_users_email'), 'app_users', ['email'], unique=True)

    # 2. Tabel etl_activity_log
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

    # 3. Tabel mapping_presets
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
    op.drop_table('mapping_presets')
    op.drop_table('etl_activity_log')
    op.drop_table('app_users')
