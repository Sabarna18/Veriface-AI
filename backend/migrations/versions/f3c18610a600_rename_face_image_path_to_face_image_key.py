"""rename face_image_key to face_image_key

Revision ID: <new_revision_id>
Revises: 6c7208bf5555
Create Date: <generated>

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers
revision: str = "<new_revision_id>"
down_revision: Union[str, Sequence[str], None] = "6c7208bf5555"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "face_image_key",
        new_column_name="face_image_key",
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "face_image_key",
        new_column_name="face_image_key",
    )
