# backend/src/main.py

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# -------------------- API ROUTERS --------------------
from api import (
    attendance_router,
    auth_router,
    classroom_router,
    health_router,
    recognition_router,
    registration_router,
    users_router,
)

# -------------------- CONFIG --------------------
from core.config import settings

# -------------------- DB (OPTIONAL) --------------------


# -------------------- APP LIFESPAN --------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup & shutdown logic.
    """
    # Create DB tables if DB is used
    try:
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database initialization skipped: {e}")

    yield

    # Shutdown cleanup (future use)
    print("👋 Application shutdown")


# -------------------- FASTAPI APP --------------------
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    lifespan=lifespan,
    root_path=settings.API_ROOT_PATH,
)


# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------- ROUTERS --------------------
app.include_router(health_router)
app.include_router(registration_router)
app.include_router(recognition_router)
app.include_router(attendance_router)
app.include_router(users_router)
app.include_router(classroom_router)
app.include_router(auth_router)


# -------------------- ROOT --------------------
@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }
