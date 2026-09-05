import time
import os
import re
import sys
from twilio.rest import Client
from dotenv import load_dotenv
from app.core.router import InputRouter
from app.ai.explainer import AIExplainer

# Set stdout encoding
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+17372212163")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
router = InputRouter()
explainer = AIExplainer()

URL_REGEX = re.compile(
    r"((https?://)?[a-z0-9-]+(\.[a-z0-9-]+)+(/[^\s]*)?)", re.IGNORECASE
)

def extract_url(text: str):
    match = URL_REGEX.search(text)
    return match.group(0) if match else None

def start_poller():
    print("[ACTIVE] WhatsApp Direct Auto-Responder is ACTIVE!")
    print(f"[CONFIG] Sender: {TWILIO_WHATSAPP_FROM}")
    
    # Store processed message SIDs
    processed_sids = set()
    
    # Pre-populate with recent messages so we only answer new incoming ones
    try:
        initial_msgs = client.messages.list(limit=20)
        for m in initial_msgs:
            processed_sids.add(m.sid)
    except Exception as e:
        print(f"[WARN] Initial sync: {e}")

    print("[WAITING] Listening for incoming messages on WhatsApp...")

    while True:
        try:
            # Fetch recent incoming messages
            messages = client.messages.list(limit=10)
            
            for msg in reversed(messages):
                # Check if it's incoming to our WhatsApp bot and not processed yet
                if msg.sid not in processed_sids and msg.direction == "inbound":
                    processed_sids.add(msg.sid)
                    
                    sender = msg.from_
                    body = (msg.body or "").strip()
                    
                    # Ignore sandbox join keywords
                    if body.lower().startswith("join "):
                        print(f"[JOIN] Message from {sender}: {body}")
                        continue
                    
                    print(f"\n[NEW MESSAGE] from {sender}: {body}")
                    
                    url = extract_url(body)
                    
                    # Run analysis pipeline
                    results, risk_score, risk_level = router.route_and_analyze(text=body, url=url)
                    results_dict = [r.dict() for r in results]
                    
                    # AI Explanation
                    explanation = explainer.generate_explanation(
                        results_dict, risk_score, risk_level, language="English"
                    )
                    
                    risk_emoji = {
                        "Low": "🟢", "Medium": "🟡", "High": "🟠", "Critical": "🔴"
                    }.get(risk_level, "⚪")
                    
                    reply_text = (
                        f"🛡️ *WhatsApp Suraksha Report*\n\n"
                        f"{risk_emoji} *Risk Level:* {risk_level} ({int(risk_score)}/100)\n"
                        f"🎯 *Fraud Type:* {explanation.fraud_type}\n\n"
                        f"📋 *Summary:*\n{explanation.summary}\n\n"
                        f"🔍 *Why suspicious?*\n" +
                        "\n".join(f"• {e}" for e in explanation.evidence[:4]) +
                        f"\n\n✅ *What to do:*\n{explanation.recommended_action}\n\n"
                        f"_Evidence-based risk assessment._"
                    )
                    
                    # Send response directly back to sender on WhatsApp
                    print(f"[SENDING] Delivering reply to {sender}...")
                    sent = client.messages.create(
                        from_=TWILIO_WHATSAPP_FROM,
                        to=sender,
                        body=reply_text
                    )
                    print(f"[SUCCESS] Reply delivered! SID: {sent.sid}")
                    
        except Exception as err:
            print(f"[ERROR] Polling loop: {err}")
            
        time.sleep(2)

if __name__ == "__main__":
    start_poller()
