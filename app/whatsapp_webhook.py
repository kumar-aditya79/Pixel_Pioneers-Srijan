from fastapi import Request, Form
from fastapi.responses import Response
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from app.core.router import InputRouter
from app.ai.explainer import AIExplainer
from app.accessibility.tts import TTSGenerator
from app.visualizer.gauge_generator import GaugeGenerator
import os
import re

router = InputRouter()
explainer = AIExplainer()
tts_generator = TTSGenerator()
gauge_generator = GaugeGenerator()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
PUBLIC_URL = os.getenv("PUBLIC_URL", "http://localhost:8000")  # ngrok URL

URL_REGEX = re.compile(
    r"((https?://)?[a-z0-9-]+(\.[a-z0-9-]+)+(/[^\s]*)?)", re.IGNORECASE
)

def extract_url(text: str):
    match = URL_REGEX.search(text)
    return match.group(0) if match else None


async def handle_whatsapp_message(
    Body: str = Form(""),
    From: str = Form(""),
    MediaUrl0: str = Form(None),
    MediaContentType0: str = Form(None),
):
    """
    Twilio posts here when a WhatsApp message arrives.
    We analyze the content and reply with text + media.
    """
    twilio_resp = MessagingResponse()
    user_number = From  # e.g. whatsapp:+919XXXXXXXXX

    text = Body.strip()
    url = extract_url(text) if text else None
    file_bytes = None
    filename = None

    # Download media if the user sent a file (e.g. APK)
    if MediaUrl0 and MediaContentType0:
        try:
            import requests as req_lib
            auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            media_resp = req_lib.get(MediaUrl0, auth=auth, timeout=10)
            file_bytes = media_resp.content
            # Guess filename from content type
            ext_map = {
                "application/vnd.android.package-archive": "upload.apk",
                "application/pdf": "upload.pdf",
            }
            filename = ext_map.get(MediaContentType0, "upload.bin")
        except Exception as e:
            twilio_resp.message(f"⚠️ Could not download your file: {e}")
            return Response(content=str(twilio_resp), media_type="application/xml")

    # Nothing to analyze
    if not text and not file_bytes:
        twilio_resp.message(
            "🛡️ *WhatsApp Suraksha*\n\nHello! Forward me any suspicious message, link, or APK file and I will analyze it for fraud risk.\n\n_This is evidence-based risk assessment, not a guarantee._"
        )
        return Response(content=str(twilio_resp), media_type="application/xml")

    # --- Run Analysis Pipeline ---
    results, risk_score, risk_level = router.route_and_analyze(text, url, file_bytes, filename)
    results_dict = [r.dict() for r in results]

    # AI explanation (English)
    explanation = explainer.generate_explanation(results_dict, risk_score, risk_level, language="English")

    # Hindi explanation for voice note
    explanation_hi = explainer.generate_explanation(results_dict, risk_score, risk_level, language="Hindi")

    # TTS voice note (Hindi — more accessible for Indian users)
    audio_path = tts_generator.generate_audio(
        f"{explanation_hi.summary} {explanation_hi.explanation}", lang="hi"
    )

    # Risk gauge image
    gauge_path = gauge_generator.generate_gauge(risk_score)

    # --- Build WhatsApp Reply ---
    risk_emoji = {"Low": "🟢", "Medium": "🟡", "High": "🟠", "Critical": "🔴"}.get(risk_level, "⚪")

    reply_text = (
        f"🛡️ *WhatsApp Suraksha Report*\n\n"
        f"{risk_emoji} *Risk Level:* {risk_level} ({int(risk_score)}/100)\n"
        f"🎯 *Fraud Type:* {explanation.fraud_type}\n\n"
        f"📋 *Summary:*\n{explanation.summary}\n\n"
        f"🔍 *Why suspicious?*\n" +
        "\n".join(f"• {e}" for e in explanation.evidence[:4]) +
        f"\n\n✅ *What to do:*\n{explanation.recommended_action}\n\n"
        f"_This is evidence-based risk assessment, not a guarantee of fraud._"
    )

    # Send the text reply
    twilio_resp.message(reply_text)

    # Send gauge image if we have a public URL
    if gauge_path and PUBLIC_URL and "localhost" not in PUBLIC_URL:
        gauge_filename = os.path.basename(gauge_path)
        msg_img = twilio_resp.message("")
        msg_img.media(f"{PUBLIC_URL}/static/images/{gauge_filename}")

    # Send Hindi voice note if we have a public URL
    if audio_path and PUBLIC_URL and "localhost" not in PUBLIC_URL:
        audio_filename = os.path.basename(audio_path)
        msg_audio = twilio_resp.message("🔊 Voice note (Hindi):")
        msg_audio.media(f"{PUBLIC_URL}/static/audio/{audio_filename}")

    return Response(content=str(twilio_resp), media_type="application/xml")
