from pydantic import BaseModel
from db.models import UserRole


class AdminLoginRequest(BaseModel):
    user_id: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
