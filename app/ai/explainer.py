import os
import json
from google import genai
from google.genai import types
from app.models.schemas import FraudExplanation
from typing import List, Dict

class AIExplainer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and self.api_key not in ["your_gemini_api_key_here", ""]:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Gemini client: {e}")
                self.client = None
        else:
            self.client = None

    def _fallback_explanation(self, analyzers_output: List[Dict], risk_score: float, risk_level: str, language: str = "English") -> FraudExplanation:
        """Deterministic rule-based explanation when Gemini API key is not supplied."""
        findings = []
        fraud_type = "Suspicious Message"
        
        has_urgency = False
        has_impersonation = False
        has_credentials = False
        has_suspicious_url = False
        has_malicious_apk = False

        for a in analyzers_output:
            for f in a.get("findings", []):
                findings.append(f)
                f_lower = f.lower()
                if "urgency" in f_lower:
                    has_urgency = True
                if "impersonation" in f_lower or "bank" in f_lower or "kyc" in f_lower:
                    has_impersonation = True
                if "sensitive" in f_lower or "otp" in f_lower or "credential" in f_lower:
                    has_credentials = True
                if "tld" in f_lower or "domain" in f_lower or "typosquatting" in f_lower or "url shortener" in f_lower:
                    has_suspicious_url = True
                if "apk" in f_lower or "permission" in f_lower:
                    has_malicious_apk = True

        if has_malicious_apk:
            fraud_type = "Malicious APK / Trojan"
        elif has_suspicious_url and (has_impersonation or has_credentials):
            fraud_type = "Phishing / Fake KYC Scam"
        elif has_urgency and has_credentials:
            fraud_type = "Credential Theft / OTP Scam"
        elif has_impersonation:
            fraud_type = "Brand Impersonation Scam"
        elif risk_score < 25:
            fraud_type = "Safe / Low Risk"

        if language.lower() == "hindi":
            if risk_level in ["High", "Critical"]:
                summary = f"यह संदेश {fraud_type} का एक गंभीर संकेत देता है। तुरंत सतर्क रहें।"
                rec = "किसी भी लिंक पर क्लिक न करें, न ही कोई OTP या व्यक्तिगत जानकारी साझा करें।"
                exp = f"इस संदेश में संदिग्ध संकेत मिले हैं जैसे: {', '.join(findings[:3])}। यह आपके पैसे या खाते को चुराने की कोशिश हो सकती है।"
            else:
                summary = "इस संदेश में कोई गंभीर धोखाधड़ी का संकेत नहीं मिला।"
                rec = "हमेशा अज्ञात स्रोतों से प्राप्त संदेशों से सावधान रहें।"
                exp = "सामग्री की जांच की गई और यह कम जोखिम वाली प्रतीत होती है।"
        else:
            if risk_level in ["High", "Critical"]:
                summary = f"This content shows strong indicators of a {fraud_type}."
                rec = "Do NOT click any links, do NOT share OTPs/passwords, and do NOT install unknown files."
                exp = f"The analysis detected multiple red flags: {', '.join(findings[:3])}. Legitimate organizations never request urgent verification via suspicious unofficial links."
            elif risk_level == "Medium":
                summary = f"This content appears suspicious and matches patterns of a {fraud_type}."
                rec = "Verify the authenticity directly with the official organization before taking any action."
                exp = f"We detected suspicious characteristics: {', '.join(findings[:3])}."
            else:
                summary = "No major fraud indicators detected in this content."
                rec = "No immediate action required, but always stay cautious with unexpected forwards."
                exp = "The message structure and links appear safe based on current heuristics."

        return FraudExplanation(
            summary=summary,
            fraud_type=fraud_type,
            risk_level=risk_level,
            confidence="High" if len(findings) >= 2 else "Medium",
            evidence=findings if findings else ["Content evaluated against fraud pattern database."],
            recommended_action=rec,
            explanation=exp
        )

    def generate_explanation(self, analyzers_output: List[Dict], risk_score: float, risk_level: str, language: str = "English") -> FraudExplanation:
        if not self.client:
            return self._fallback_explanation(analyzers_output, risk_score, risk_level, language)

        prompt = f"""
        You are a fraud analysis AI for WhatsApp. Analyze the following evidence from our deterministic analyzers and generate a structured JSON explanation.
        You MUST NEVER invent facts. Only use the provided evidence.

        Language requested: {language}
        (Provide the final JSON values in the requested language).

        System Risk Score: {risk_score}/100
        System Risk Level: {risk_level}

        Analyzer Evidence:
        {json.dumps(analyzers_output, indent=2)}

        Return a JSON object strictly matching this schema:
        {{
            "summary": "Short 1-sentence summary",
            "fraud_type": "Categorize the fraud (e.g., Phishing, Malware, Fake KYC, Safe)",
            "risk_level": "{risk_level}",
            "confidence": "High/Medium/Low based on evidence strength",
            "evidence": ["list", "of", "explained", "evidence points"],
            "recommended_action": "What the user should do next",
            "explanation": "A short paragraph explaining why this is or isn't safe"
        }}
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            
            resp_dict = json.loads(response.text)
            return FraudExplanation(**resp_dict)
            
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return self._fallback_explanation(analyzers_output, risk_score, risk_level, language)
