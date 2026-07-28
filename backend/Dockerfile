# ==========================================================
# Backend Dockerfile
# VeriFace AI
# ==========================================================

FROM python:3.13-slim

# ----------------------------------------------------------
# Environment
# ----------------------------------------------------------

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEEPFACE_HOME=/home/veriface

WORKDIR /app

# ----------------------------------------------------------
# System Dependencies
# ----------------------------------------------------------

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------------------------------------
# Install uv
# ----------------------------------------------------------

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# ----------------------------------------------------------
# Install Python Dependencies
# ----------------------------------------------------------

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

# ----------------------------------------------------------
# Copy Application
# ----------------------------------------------------------

COPY . .

# ----------------------------------------------------------
# Configure Entrypoint
# ----------------------------------------------------------

RUN chmod +x /app/docker-entrypoint.sh

# ----------------------------------------------------------
# Create Non-Root Runtime User
# ----------------------------------------------------------

RUN groupadd --system veriface \
    && useradd \
        --system \
        --gid veriface \
        --create-home \
        --home-dir /home/veriface \
        veriface \
    && mkdir -p \
        /app/data \
        /app/models \
        /app/logs \
        /home/veriface/.deepface/weights \
    && chown -R veriface:veriface \
        /app \
        /home/veriface

# ----------------------------------------------------------
# Runtime User
# ----------------------------------------------------------

USER veriface

# ----------------------------------------------------------
# Expose FastAPI Port
# ----------------------------------------------------------

EXPOSE 8002

# ----------------------------------------------------------
# Start
# ----------------------------------------------------------

ENTRYPOINT ["/app/docker-entrypoint.sh"]