from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uuid
from services.watsonx import transcribe_audio, summarize_visit
import os
import requests
from ibm_watson import SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import json
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
# Load dummy data at startup
data_path = Path(__file__).parent / "data" / "visits.json"
with open(data_path) as f:
    visits = json.load(f)
data_requests = {}  # request_id -> { status: pending/approved/denied, data: ... }

# Mock patient data
MOCK_PATIENT_DATA = {
    "name": "Jane Doe",
    "dob": "1990-04-12",
    "conditions": ["Type 2 Diabetes", "Hypertension"],
    "medications": ["Metformin", "Lisinopril"],
    "allergies": ["Penicillin"],
}

@app.get("/ping")
def ping():
    return {"message": "pong"}

# visit notes
@app.post("/api/visits/summarize")
async def summarize_visit_route(
    notes: str = Form(...),
    audio: Optional[UploadFile] = File(None)
):
    transcript = ""
    if audio:
        audio_bytes = await audio.read()
        transcript = transcribe_audio(audio_bytes, content_type=audio.content_type)

    summary = summarize_visit(transcript, notes)

    visit = {
        "id": str(uuid.uuid4()),
        "notes": notes,
        "transcript": transcript,
        "summary": summary,
    }
    visits.append(visit)
    return visit

@app.get("/api/visits")
def get_visits():
    return visits

# patient consent
@app.post("/api/data-request")
def create_data_request():
    request_id = str(uuid.uuid4())
    data_requests[request_id] = {"status": "pending", "data": None}
    return {"request_id": request_id}

@app.get("/api/data-request/{request_id}")
def get_data_request(request_id: str):
    req = data_requests.get(request_id)
    if not req:
        return {"status": "not_found"}
    return {"request_id": request_id, **req}

@app.get("/api/data-request/pending/all")
def get_pending_requests():
    pending = [
        {"request_id": rid, **val}
        for rid, val in data_requests.items()
        if val["status"] == "pending"
    ]
    return pending

@app.post("/api/data-request/{request_id}/respond")
def respond_to_request(request_id: str, approved: bool):
    req = data_requests.get(request_id)
    if not req:
        return {"error": "not found"}
    if approved:
        data_requests[request_id] = {"status": "approved", "data": MOCK_PATIENT_DATA}
    else:
        data_requests[request_id] = {"status": "denied", "data": None}
    return {"status": data_requests[request_id]["status"]}
