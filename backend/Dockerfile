# ==========================================================
# Backend Dockerfile
# VeriFace AI
# ==========================================================

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# ----------------------------------------------------------
# System Dependencies
# ----------------------------------------------------------

RUN apt-get update && apt-get install -y \
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
# Install dependencies
# ----------------------------------------------------------

COPY pyproject.toml uv.lock* ./

RUN uv sync --frozen --no-dev

# ----------------------------------------------------------
# Copy application
# ----------------------------------------------------------

COPY . .

# ----------------------------------------------------------
# Expose
# ----------------------------------------------------------

EXPOSE 8002

# ----------------------------------------------------------
# Start
# ----------------------------------------------------------

    
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]