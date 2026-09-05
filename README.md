# WhatsApp Suraksha 🛡️

**WhatsApp Suraksha** is an MVP fraud-awareness system built to detect and explain WhatsApp scams, phishing links, and malicious APKs. It provides human-readable explanations, bilingual voice notes (English/Hindi), and a visual risk gauge to ensure everyone—especially elderly or non-English speakers—can understand the risk of forwarded content.

## 🚀 Features

- **Text Analysis**: Detects urgency, impersonation, and credential/OTP requests.
- **URL Analysis**: Flags suspicious domains, URL shorteners, and typo-squatting.
- **APK Static Analysis**: Scans AndroidManifest.xml for dangerous permissions (no code execution).
- **AI Explanation Layer**: Uses Google Gemini to generate clear, structured explanations of the threat.
- **Accessibility**: Translates reports to Hindi and generates Text-to-Speech (TTS) audio files.
- **Visual Risk Meter**: Dynamically generates a red/yellow/green gauge image based on the final risk score.

## 🛠️ Tech Stack
- **Backend Framework**: FastAPI (Python)
- **AI**: Google Gemini (`google-genai`)
- **Audio Generation**: `gTTS`
- **Image Generation**: Pillow (PIL)
- **Validation**: Pydantic

## 💻 Local Setup (Backend)

1. **Clone the repository**
   ```bash
   git clone https://github.com/kumar-aditya79/Pixel_Pioneers-Srijan.git
   cd Pixel_Pioneers-Srijan
   ```

2. **Create a virtual environment and install dependencies**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   Rename `.env.example` to `.env` and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_real_api_key_here
   PORT=8000
   ```

4. **Run the API**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Run Tests**
   ```bash
   python -m pytest tests/demo_scenarios.py
   ```

## 🔗 API Endpoints

### `POST /analyze`
Accepts `multipart/form-data`.
- `text` (optional): The text message to analyze.
- `url` (optional): The link to analyze.
- `file` (optional): An uploaded APK file.

**Response**:
Returns a JSON object containing the risk score, the AI explanation (summary, fraud_type, risk_level, confidence, evidence, recommended_action), and URLs to the generated TTS audio and risk gauge image.
