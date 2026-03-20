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
FORMS_FILE = Path(__file__).parent / "data" / "forms.json"
REQUESTS_FILE = Path(__file__).parent / "data" / "requests.json"
PROVIDER_FORMS_FILE = Path(__file__).parent / "data" / "provider_forms.json"

def load_forms():
    with open(FORMS_FILE) as f:
        return json.load(f)

def load_requests():
    with open(REQUESTS_FILE) as f:
        return json.load(f)

def save_requests(requests):
    with open(REQUESTS_FILE, "w") as f:
        json.dump(requests, f, indent=2)

def load_provider_forms():
    with open(PROVIDER_FORMS_FILE) as f:
        return json.load(f)

def load_visits():
    with open(VISITS_FILE) as f:
        return json.load(f)
def save_visits(visits):
    with open(VISITS_FILE, "w") as f:
        json.dump(visits, f, indent=2)
# Load at startup
visits = load_visits()

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

# --- Requests ---
@app.post("/api/requests")
def create_request(current_user: User = Depends(get_current_user)):
    provider_forms = load_provider_forms()
    form_ids = provider_forms.get(current_user.email, [])

    # Build per-form status
    form_statuses = {fid: "pending" for fid in form_ids}

    request = {
        "id": str(uuid.uuid4()),
        "provider_email": current_user.email,
        "provider_name": current_user.name,
        "institution": current_user.institution,
        "form_statuses": form_statuses,
        "overall_status": "pending",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    requests_data = load_requests()
    requests_data.append(request)
    save_requests(requests_data)
    return request

@app.get("/api/requests/pending")
def get_pending_requests_new(current_user: User = Depends(get_current_user)):
    requests_data = load_requests()
    pending = [r for r in requests_data if r["overall_status"] == "pending"]
    return pending

@app.get("/api/requests/{request_id}/status")
def get_request_status(request_id: str, current_user: User = Depends(get_current_user)):
    requests_data = load_requests()
    req = next((r for r in requests_data if r["id"] == request_id), None)
    if not req:
        return {"error": "not found"}
    return req

@app.post("/api/requests/{request_id}/respond")
def respond_to_form_request(
    request_id: str,
    form_id: str,
    approved: bool,
    current_user: User = Depends(get_current_user)
):
    requests_data = load_requests()
    req = next((r for r in requests_data if r["id"] == request_id), None)
    if not req:
        return {"error": "not found"}

    req["form_statuses"][form_id] = "approved" if approved else "denied"

    # Update overall status
    statuses = list(req["form_statuses"].values())
    if all(s == "approved" for s in statuses):
        req["overall_status"] = "approved"
    elif any(s == "denied" for s in statuses):
        req["overall_status"] = "denied"
    # else still pending

    save_requests(requests_data)
    return req

# --- Forms ---

@app.get("/api/forms")
def get_forms(current_user: User = Depends(get_current_user)):
    return load_forms()

@app.post("/api/forms/dh9")
def submit_dh9(
    answers: dict,
    current_user: User = Depends(get_current_user)
):
    forms_data = load_forms()
    for form in forms_data["forms"]:
        if form["id"] == "dh9":
            form["filled"] = True
            form["data"] = answers
    with open(FORMS_FILE, "w") as f:
        json.dump(forms_data, f, indent=2)
    return {"status": "submitted"}
