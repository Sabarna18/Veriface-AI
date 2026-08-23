# ==========================================================
# Stage 1
# React Build
# ==========================================================

FROM node:22-alpine AS builder

WORKDIR /frontend

# ----------------------------------------------------------
# Application version
# Passed during Docker build:
# --build-arg APP_VERSION=1.0.0
# ----------------------------------------------------------

ARG APP_VERSION=dev
ENV VITE_APP_VERSION=${APP_VERSION}

# Install dependencies first for better Docker layer caching

COPY frontend/package*.json ./

RUN npm ci

# Copy frontend source

COPY frontend/ .

# Build production React application

RUN npm run build


# ==========================================================
# Stage 2
# Nginx Runtime
# ==========================================================

FROM nginx:1.28-alpine

# ----------------------------------------------------------
# Prepare Nginx directories for non-root execution
# ----------------------------------------------------------

RUN rm -rf /usr/share/nginx/html/* \
    && mkdir -p /var/cache/nginx \
    && mkdir -p /var/run \
    && mkdir -p /tmp/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run \
    && chown -R nginx:nginx /tmp/nginx \
    && chown -R nginx:nginx /usr/share/nginx/html

# ----------------------------------------------------------
# Nginx configuration
# ----------------------------------------------------------

COPY nginx/nginx.conf /etc/nginx/nginx.conf

# ----------------------------------------------------------
# React production build
# ----------------------------------------------------------

COPY --from=builder --chown=nginx:nginx \
    /frontend/dist /usr/share/nginx/html

# ----------------------------------------------------------
# Security
# ----------------------------------------------------------

USER nginx

# Nginx runs internally on unprivileged port 8000

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]