# backend/src/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api import users

# -------------------- CONFIG --------------------
from core.config import settings

# -------------------- API ROUTERS --------------------
from api import (
    health_router,
    registration_router,
    recognition_router,
    attendance_router,
    users_router,
    classroom_router,
    auth_router
    
)

# -------------------- DB (OPTIONAL) --------------------
from db.database import Base, engine


# -------------------- APP LIFESPAN --------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup & shutdown logic.
    """
    # Create DB tables if DB is used
    try:
        Base.metadata.create_all(bind=engine)
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
)


# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",],  # change to frontend URL in production
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
