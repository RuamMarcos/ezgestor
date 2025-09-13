# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the frontend application
RUN npm run build

# Stage 2: Build the Django Backend
FROM python:3.11-slim AS backend-builder

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ .

# Stage 3: Final Production Image
FROM python:3.11-slim

WORKDIR /app

# Set environment variables for Gunicorn
ENV GUNICORN_CMD_ARGS="--workers=2 --threads=4 --worker-class=gthread --bind=0.0.0.0:8080"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Bring installed Python packages and gunicorn from the builder
COPY --from=backend-builder /usr/local /usr/local

# Copy backend app code
COPY --from=backend-builder /app .

# Copy built frontend to staticfiles
COPY --from=frontend-builder /app/frontend/dist /app/frontend_dist

# Collect static files (including React build) with Django's collectstatic
ENV DJANGO_SETTINGS_MODULE=ezgestor_api.settings
ENV DEBUG=False
ENV FRONTEND_DIST=/app/frontend_dist
RUN python manage.py collectstatic --noinput

EXPOSE 8080

CMD exec gunicorn ezgestor_api.wsgi:application $GUNICORN_CMD_ARGS