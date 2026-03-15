from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uvicorn
import os
import uuid

app = FastAPI()

# Allow React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model
model = WhisperModel("small", device="cpu", compute_type="int8")

# Create folders
os.makedirs("audio_files", exist_ok=True)
os.makedirs("transcripts", exist_ok=True)


@app.post("/api/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    user_id: str = Form(...)
):

    print(f"🎤 Request received from {user_id}")

    try:

        unique_file = str(uuid.uuid4())
        audio_path = f"audio_files/{unique_file}.webm"

        # Save audio
        with open(audio_path, "wb") as f:
            f.write(await audio.read())

        # Transcribe
        segments, _ = model.transcribe(audio_path, language="en")

        text = " ".join([s.text.strip() for s in segments])

        # Save per user
        user_file = f"transcripts/{user_id}.txt"

        with open(user_file, "a", encoding="utf-8") as f:
            f.write(text + "\n")

        print(f"✅ {user_id}: {text}")

        # Delete temp audio
        os.remove(audio_path)

        return {"status": "saved"}

    except Exception as e:

        print(f"❌ Error: {e}")
        return {"status": "error"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)