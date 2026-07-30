# Multi-stage build: Node builds the React frontend, then a Python image
# runs FastAPI, which serves that built frontend + the API from one process.
# This is what lets this whole app deploy as a single Render Web Service
# (created via "New -> Web Service", not the Blueprint flow).

# ---- Stage 1: build the frontend ----
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Same-origin in production -- the frontend now calls itself, no separate backend URL.
ENV VITE_API_URL=""
RUN npm run build

# ---- Stage 2: run the backend, serving the built frontend ----
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
