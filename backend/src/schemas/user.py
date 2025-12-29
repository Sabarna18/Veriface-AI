# backend/src/schemas/user.py

from pydantic import BaseModel, Field
from typing import Optional


# -------------------- REGISTRATION --------------------

class UserRegisterRequest(BaseModel):
    """
    Request schema for user face registration.
    Used mainly for documentation (multipart handled separately).
    """
    user_id: str = Field(..., example="student_001")


class UserRegisterResponse(BaseModel):
    """
    Response returned after successful registration.
    """
    message: str = Field(example="User registered successfully")
    user_id: str = Field(example="student_001")


# -------------------- RECOGNITION --------------------

class RecognitionResponse(BaseModel):
    """
    Response returned after face recognition attempt.
    """
    matched: bool = Field(..., example=True)
    user_id: Optional[str] = Field(None, example="student_001")
    distance: Optional[float] = Field(
        None,
        example=0.42,
        description="Cosine distance between face embeddings"
    )
    message: Optional[str] = Field(
        None,
        example="No matching face found"
    )
