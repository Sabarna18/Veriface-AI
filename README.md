# Face Recognition Attendance System

An **AI-powered Face Recognition Attendance System** built using **FastAPI**, **DeepFace (ArcFace)**, and a **React + Tailwind CSS** frontend.

The system allows users to:
- Register their face
- Verify identity using face recognition
- Mark attendance securely
- Manage users (admin)
- View daily attendance records

This project follows **production-grade architecture**, clean separation of concerns, and is fully tested on the backend.

---

## 🚀 Features

### Backend (FastAPI)
- Face registration with image upload
- Identity-based face verification (1-to-1)
- Attendance marking (once per day per user)
- User management (get, delete single, delete all)
- CSV-based attendance storage
- Embedding persistence using pickle
- Modular, testable architecture
- `uv` + `pytest` workflow

### Frontend (React + Tailwind)
- Modern React (hooks + functional components)
- Webcam capture for recognition
- File upload for registration
- Clean, responsive Tailwind UI
- Admin user management panel
- Attendance dashboard

---

## 🏗️ Project Structure

face-attendance-system/
│
├── backend/
│ ├── src/
│ │ ├── api/ # FastAPI routes
│ │ ├── core/ # Face recognition logic
│ │ ├── utils/ # Helpers
│ │ ├── schemas/ # Pydantic models
│ │ └── main.py # FastAPI app
│ │
│ ├── scripts/ # CLI utilities
│ ├── tests/ # Pytest suite
│ ├── data/ # Faces, embeddings, attendance CSV
│ ├── models/ # Cached ML models
│ ├── main.py # Uvicorn runner
│ ├── pyproject.toml
│ └── .env
│
├── frontend/
│ └── react-app/
│ ├── src/
│ │ ├── components/
│ │ ├── api/
│ │ └── pages/
│ └── package.json
│
└── docker/ # (optional) deployment configs


---

## 🧠 Technology Stack

### Backend
- Python 3.10+
- FastAPI
- DeepFace (ArcFace)
- OpenCV
- NumPy / Pandas
- Pydantic v2
- Uvicorn
- Pytest
- uv (package & env manager)

### Frontend
- React (Vite)
- Tailwind CSS
- Fetch API
- Modern browser webcam APIs

---

## ⚙️ Backend Setup

### 1️⃣ Create environment
```bash
cd backend
uv venv
uv pip install -e .[dev]