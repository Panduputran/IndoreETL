"""Add auth_provider and avatar_url to app_users table

Revision ID: 0004_update_app_users_sso
Revises: 0003_create_mapping_presets
Create Date: 2026-09-02 15:16:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0004_update_app_users_sso'
down_revision: Union[str, None] = '0003_create_mapping_presets'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add auth_provider and avatar_url columns to app_users
    op.add_column('app_users', sa.Column('auth_provider', sa.String(length=50), server_default='local', nullable=False))
    op.add_column('app_users', sa.Column('avatar_url', sa.String(length=500), nullable=True))
    op.alter_column('app_users', 'password_hash', existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    op.alter_column('app_users', 'password_hash', existing_type=sa.String(length=255), nullable=False)
    op.drop_column('app_users', 'avatar_url')
    op.drop_column('app_users', 'auth_provider')
