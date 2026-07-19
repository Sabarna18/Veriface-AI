# ==========================================================
# Stage 1
# React Build
# ==========================================================

FROM node:22-alpine AS builder

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ .

RUN npm run build

# ==========================================================
# Stage 2
# Nginx Runtime
# ==========================================================

FROM nginx:1.28-alpine

# Remove default content
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy React build
COPY --from=builder /frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx","-g","daemon off;"]