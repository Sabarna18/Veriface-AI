from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, UserRole
from schemas.auth import AdminLoginRequest, AdminLoginResponse
from core.security import verify_password, create_access_token
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer , OAuth2PasswordRequestForm
from jose import JWTError, jwt

from core.config import settings
from db.models import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

def get_current_admin(
    token: str = Depends(oauth2_scheme),
):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        user_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")

        if user_id is None or role != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin token",
            )

        return {
            "user_id": user_id,
            "role": role,
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
)
def get_admin_me(
    admin=Depends(get_current_admin),
):
    """
    Return currently authenticated admin info.
    """
    return admin


# @router.post(
#     "/login",
#     response_model=AdminLoginResponse,
#     status_code=status.HTTP_200_OK
# )
# def admin_login(
#     payload: AdminLoginRequest,
#     db: Session = Depends(get_db)
# ):
#     """
#     Admin authentication endpoint.
#     Students are NOT allowed to login here.
#     """

#     # 1️⃣ Fetch user by user_id
#     user = (
#         db.query(User)
#         .filter(User.user_id == payload.user_id)
#         .first()
#     )

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="User not found"
#         )

#     # 2️⃣ Ensure user is ADMIN
#     if user.role != UserRole.ADMIN:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Admin access only"
#         )

#     # 3️⃣ Check admin active status
#     if not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Admin account is inactive"
#         )

#     # 4️⃣ Verify password
#     if not user.hashed_password:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Admin password not configured"
#         )

#     if not verify_password(payload.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid credentials"
#         )

#     # 5️⃣ Create JWT token
#     access_token = create_access_token(
#         data={
#             "sub": user.user_id,
#             "role": user.role.value
#         }
#     )

#     # 6️⃣ Return token
#     return AdminLoginResponse(
#         access_token=access_token,
#         token_type="bearer",
#         role=user.role
#     )



@router.post(
    "/login",
    response_model=AdminLoginResponse,
    status_code=status.HTTP_200_OK
)
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.user_id == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Admin account is inactive")

    if not user.hashed_password:
        raise HTTPException(status_code=500, detail="Admin password not configured")

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={
            "sub": user.user_id,
            "role": user.role.value
        }
    )

    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role
    )
