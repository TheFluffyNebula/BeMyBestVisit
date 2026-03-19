from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
visits = []

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.post("/api/visits/summarize")
async def summarize_visit(
    notes: str = Form(...),
    audio: Optional[UploadFile] = File(None)
):
    # Mock summary for now — will swap in Watsonx later
    summary = f"Patient presented with symptoms described in notes. Doctor observed: {notes[:100]}. Follow-up recommended."
    
    visit = {
        "id": str(uuid.uuid4()),
        "notes": notes,
        "summary": summary,
    }
    visits.append(visit)
    return visit

@app.get("/api/visits")
def get_visits():
    return visits
