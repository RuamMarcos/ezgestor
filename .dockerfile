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
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ .

# Stage 3: Final Production Image
FROM python:3.11-slim

WORKDIR /app

# Set environment variables for Gunicorn
ENV GUNICORN_CMD_ARGS="--workers=2 --threads=4 --worker-class=gthread --bind=0.0.0.0:$PORT"

# Copy backend from the backend-builder stage
COPY --from=backend-builder /app .

# Copy built frontend from the frontend-builder stage to the staticfiles directory
COPY --from=frontend-builder /app/frontend/dist /app/staticfiles

# Expose the port Cloud Run will use
EXPOSE 8080

# Run the application
CMD exec gunicorn ezgestor_api.wsgi:application $GUNICORN_CMD_ARGS