from fastapi import FastAPI, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.router import InputRouter
from app.ai.explainer import AIExplainer
from app.accessibility.tts import TTSGenerator
from app.visualizer.gauge_generator import GaugeGenerator
from app.models.schemas import FinalReport
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="WhatsApp Suraksha API")

# Allow the Next.js frontend (localhost:3000) to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist
os.makedirs("static/audio", exist_ok=True)
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

router = InputRouter()
explainer = AIExplainer()
tts_generator = TTSGenerator()
gauge_generator = GaugeGenerator()

@app.post("/analyze", response_model=FinalReport)
async def analyze_endpoint(
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    file_bytes = None
    filename = None
    if file:
        file_bytes = await file.read()
        filename = file.filename

    # 1. Route to analyzers → deterministic risk score
    results, risk_score, risk_level = router.route_and_analyze(text, url, file_bytes, filename)

    # 2. AI Explanation — English
    results_dict = [r.dict() for r in results]
    explanation_en = explainer.generate_explanation(results_dict, risk_score, risk_level, language="English")

    # 3. AI Explanation — Hindi
    explanation_hi = explainer.generate_explanation(results_dict, risk_score, risk_level, language="Hindi")

    # 4. TTS voice notes
    audio_path_en = tts_generator.generate_audio(
        f"{explanation_en.summary} {explanation_en.explanation}", lang="en"
    )
    audio_path_hi = tts_generator.generate_audio(
        f"{explanation_hi.summary} {explanation_hi.explanation}", lang="hi"
    )

    # 5. Risk gauge image
    gauge_path = gauge_generator.generate_gauge(risk_score)

    return {
        "explanation": explanation_en.dict(),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "audio_url_en": f"/static/audio/{os.path.basename(audio_path_en)}" if audio_path_en else None,
        "audio_url_hi": f"/static/audio/{os.path.basename(audio_path_hi)}" if audio_path_hi else None,
        "gauge_image_url": f"/static/images/{os.path.basename(gauge_path)}" if gauge_path else None,
    }

@app.get("/")
def read_root():
    return {"message": "WhatsApp Suraksha Backend is Running"}

# ─── WhatsApp Webhook (Twilio) ────────────────────────────────────────────────
from app.whatsapp_webhook import handle_whatsapp_message
from fastapi import Request as FastAPIRequest

@app.post("/whatsapp")
async def whatsapp_webhook(request: FastAPIRequest):
    form = await request.form()
    return await handle_whatsapp_message(
        Body=form.get("Body", ""),
        From=form.get("From", ""),
        MediaUrl0=form.get("MediaUrl0"),
        MediaContentType0=form.get("MediaContentType0"),
    )
