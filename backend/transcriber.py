from faster_whisper import WhisperModel

# Load Whisper model (runs once when server starts)
model = WhisperModel("base", compute_type="int8")


def transcribe_audio(audio_path):

    segments, info = model.transcribe(audio_path)

    text_output = ""

    for segment in segments:
        text_output += segment.text

    return text_output