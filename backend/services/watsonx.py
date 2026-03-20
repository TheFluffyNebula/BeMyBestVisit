import os
import requests
from ibm_watson import SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv

load_dotenv()

# --- Speech to Text ---
def transcribe_audio(audio_bytes: bytes, content_type: str = "audio/wav") -> str:
    authenticator = IAMAuthenticator(os.getenv("IBM_STT_API_KEY"))
    stt = SpeechToTextV1(authenticator=authenticator)
    stt.set_service_url(os.getenv("IBM_STT_URL"))

    # Normalize content type — browsers sometimes send audio/wave or audio/x-wav
    if "wav" in content_type:
        content_type = "audio/wav"
    elif "mp4" in content_type or "m4a" in content_type:
        content_type = "audio/mp4"
    elif "ogg" in content_type:
        content_type = "audio/ogg"
    else:
        content_type = "audio/mp3"

    print(f"STT content_type: {content_type}")
    print(f"STT audio size: {len(audio_bytes)} bytes")

    result = stt.recognize(
        audio=audio_bytes,
        content_type=content_type,
        model="en-US_Multimedia",  # Better for voice memos/mic recordings
    ).get_result()

    print(f"STT result: {result}")

    transcripts = [
        r["alternatives"][0]["transcript"]
        for r in result.get("results", [])
        if r.get("alternatives")
    ]
    return " ".join(transcripts)


# --- Get IAM Bearer Token ---
def get_iam_token() -> str:
    key = os.getenv("IBM_ORCHESTRATE_API_KEY")
    print(f"API key loaded: {key[:6] if key else 'NONE'}...{key[-4:] if key else ''}")
    res = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": os.getenv("IBM_ORCHESTRATE_API_KEY")
        }
    )
    res.raise_for_status()
    return res.json()["access_token"]


# --- Call Orchestrate Agent ---
def summarize_visit(transcript: str, notes: str) -> str:
    token = get_iam_token()
    agent_id = os.getenv("IBM_ORCHESTRATE_AGENT_ID")
    base_url = os.getenv("IBM_ORCHESTRATE_URL").rstrip("/")
    url = f"{base_url}/v1/orchestrate/{agent_id}/chat/completions"

    prompt = f"""Please summarize the following doctor visit into a structured clinical note.

    Audio Transcript:
    {transcript}

    Doctor's Written Notes:
    {notes}

    Provide three sections: Chief Complaint, Observations, and Plan."""

    res = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }
    )

    print(f"Status: {res.status_code}")
    print(f"Body: {res.text}")

    res.raise_for_status()

    choices = res.json().get("choices", [])
    if not choices:
        return "No summary generated."

    message = choices[0].get("message", {})
    content = message.get("content", "")

    if isinstance(content, list):
        texts = [block.get("text", "") for block in content if block.get("response_type") == "text"]
        return " ".join(texts)

    return content