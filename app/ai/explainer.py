import os
import json
from google import genai
from google.genai import types
from app.models.schemas import FraudExplanation
from typing import List, Dict

class AIExplainer:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    def generate_explanation(self, analyzers_output: List[Dict], risk_score: float, risk_level: str, language: str = "English") -> FraudExplanation:
        if not self.client:
            # Fallback if no API key is provided
            return FraudExplanation(
                summary="AI Explanation disabled due to missing API key.",
                fraud_type="Unknown",
                risk_level=risk_level,
                confidence="Low",
                evidence=["Analyzers returned findings, but AI is offline."],
                recommended_action="Exercise caution.",
                explanation="Please configure GEMINI_API_KEY to enable AI explanations."
            )

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
            "fraud_type": "Categorize the fraud (e.g., Phishing, Malware, Safe)",
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
            
            # Parse the JSON response
            resp_dict = json.loads(response.text)
            
            return FraudExplanation(**resp_dict)
            
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return FraudExplanation(
                summary="Error generating AI explanation.",
                fraud_type="Error",
                risk_level=risk_level,
                confidence="Unknown",
                evidence=[],
                recommended_action="Review manually.",
                explanation=str(e)
            )
