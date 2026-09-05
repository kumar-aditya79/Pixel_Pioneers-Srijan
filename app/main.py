from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.staticfiles import StaticFiles
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

    # 1. Route to analyzers and get deterministic risk score
    results, risk_score, risk_level = router.route_and_analyze(text, url, file_bytes, filename)
    
    # 2. Get AI Explanation (English)
    results_dict = [r.dict() for r in results]
    explanation_en = explainer.generate_explanation(results_dict, risk_score, risk_level, language="English")
    
    # 3. Get AI Explanation (Hindi) - We can do this in parallel but sequential for MVP
    explanation_hi = explainer.generate_explanation(results_dict, risk_score, risk_level, language="Hindi")

    # 4. Generate TTS (English & Hindi)
    # The text to read is the summary + explanation
    text_to_read_en = f"{explanation_en.summary} {explanation_en.explanation}"
    text_to_read_hi = f"{explanation_hi.summary} {explanation_hi.explanation}"
    
    audio_path_en = tts_generator.generate_audio(text_to_read_en, lang="en")
    audio_path_hi = tts_generator.generate_audio(text_to_read_hi, lang="hi")

    # 5. Generate Gauge Image
    gauge_path = gauge_generator.generate_gauge(risk_score)

    return {
        "explanation": explanation_en.dict(),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "audio_url_en": f"/{audio_path_en}" if audio_path_en else None,
        "audio_url_hi": f"/{audio_path_hi}" if audio_path_hi else None,
        "gauge_image_url": f"/{gauge_path}" if gauge_path else None
    }

@app.get("/")
def read_root():
    return {"message": "WhatsApp Suraksha Backend is Running"}
