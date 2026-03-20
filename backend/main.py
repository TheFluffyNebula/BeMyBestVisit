from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uuid
from services.watsonx import transcribe_audio, summarize_visit, send_visit_email
from datetime import datetime
import json
from pathlib import Path
from auth import (
    LoginRequest, RegisterRequest, Token, User,
    login_endpoint, register_endpoint, get_current_user,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

VISITS_FILE = Path(__file__).parent / "data" / "visits.json"
def load_visits():
    with open(VISITS_FILE) as f:
        return json.load(f)
def save_visits(visits):
    with open(VISITS_FILE, "w") as f:
        json.dump(visits, f, indent=2)
# Load at startup
visits = load_visits()

# request_id -> { status, data, provider_name, provider_email }
data_requests = {}

# Mock patient data returned on consent approval
MOCK_PATIENT_DATA = {
    "name": "Jane Doe",
    "dob": "1990-04-12",
    "conditions": ["Type 2 Diabetes", "Hypertension"],
    "medications": ["Metformin", "Lisinopril"],
    "allergies": ["Penicillin"],
}

# --- Auth ---

@app.post("/api/auth/login", response_model=Token)
def login(body: LoginRequest):
    return login_endpoint(body)

@app.post("/api/auth/register", response_model=Token)
def register(body: RegisterRequest):
    return register_endpoint(body)

# --- Ping ---

@app.get("/ping")
def ping():
    return {"message": "pong"}

# --- Visits ---

@app.post("/api/visits/summarize")
async def summarize_visit_route(
    notes: str = Form(...),
    patient_email: str = Form(""),
    provider: str = Form(""),
    audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
):
    print(current_user, current_user.name)
    transcript = ""
    if audio:
        audio_bytes = await audio.read()
        transcript = transcribe_audio(audio_bytes, content_type=audio.content_type)

    summary = summarize_visit(transcript, notes)

    visit = {
        "id": str(uuid.uuid4()),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "institution": current_user.institution,
        "doctor_name": current_user.name,
        "job_title": current_user.job_title,
        "notes": notes,
        "transcript": transcript,
        "summary": summary,
    }
    visits.append(visit)
    save_visits(visits)

    # Send email notification separately
    if patient_email:
        send_visit_email(
            patient_email=patient_email,
            provider=provider,
            date=datetime.now().strftime("%B %d, %Y")
        )

    return visit

@app.get("/api/visits")
def get_visits(current_user: User = Depends(get_current_user)):
    return visits

# --- Data requests ---

# IMPORTANT: /pending/all must be defined before /{request_id}
# otherwise FastAPI matches "pending" as the request_id path param.

@app.get("/api/data-request/pending/all")
def get_pending_requests(current_user: User = Depends(get_current_user)):
    pending = [
        {"request_id": rid, **val}
        for rid, val in data_requests.items()
        if val["status"] == "pending"
    ]
    return pending

@app.post("/api/data-request")
def create_data_request(current_user: User = Depends(get_current_user)):
    request_id = str(uuid.uuid4())
    data_requests[request_id] = {
        "status": "pending",
        "data": None,
        "provider_name": current_user.name,
        "provider_email": current_user.email,
    }
    return {"request_id": request_id}

@app.get("/api/data-request/{request_id}")
def get_data_request(request_id: str, current_user: User = Depends(get_current_user)):
    req = data_requests.get(request_id)
    if not req:
        return {"status": "not_found"}
    return {"request_id": request_id, **req}

@app.post("/api/data-request/{request_id}/respond")
def respond_to_request(request_id: str, approved: bool, current_user: User = Depends(get_current_user)):
    req = data_requests.get(request_id)
    if not req:
        return {"error": "not found"}
    if approved:
        data_requests[request_id] = {**req, "status": "approved", "data": MOCK_PATIENT_DATA}
    else:
        data_requests[request_id] = {**req, "status": "denied", "data": None}
    return {"status": data_requests[request_id]["status"]}
