"""Create app_users table

Revision ID: 0001_create_app_users
Revises: 
Create Date: 2026-09-02 04:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_create_app_users'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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


def downgrade() -> None:
    op.drop_index(op.f('ix_app_users_email'), table_name='app_users')
    op.drop_index(op.f('ix_app_users_username'), table_name='app_users')
    op.drop_index(op.f('ix_app_users_id'), table_name='app_users')
    op.drop_table('app_users')
