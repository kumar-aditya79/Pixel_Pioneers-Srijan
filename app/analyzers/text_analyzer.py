import re
from app.models.schemas import AnalyzerResult

class TextAnalyzer:
    def __init__(self):
        self.urgency_keywords = ["urgent", "immediate action", "account suspended", "block", "prize", "lottery", "winner", "claim now"]
        self.impersonation_keywords = ["bank", "support", "kyc", "customer care", "police", "gov", "official"]
        self.credential_patterns = [
            r"(?i)(password|otp|pin|cvv)[\s:]*",
            r"(?i)click here to (login|verify)",
        ]

    def analyze(self, text: str) -> AnalyzerResult:
        if not text:
            return AnalyzerResult(analyzer_name="TextAnalyzer", risk_score=0.0, findings=[], details={})

        text_lower = text.lower()
        findings = []
        risk_score = 0.0

        # Check urgency
        urgency_matches = [kw for kw in self.urgency_keywords if kw in text_lower]
        if urgency_matches:
            findings.append(f"Contains urgency keywords: {', '.join(urgency_matches)}")
            risk_score += 30.0

        # Check impersonation
        impersonation_matches = [kw for kw in self.impersonation_keywords if kw in text_lower]
        if impersonation_matches:
            findings.append(f"Contains potential impersonation keywords: {', '.join(impersonation_matches)}")
            risk_score += 20.0

        # Check credential requests
        credential_matches = []
        for pattern in self.credential_patterns:
            matches = re.findall(pattern, text)
            if matches:
                credential_matches.extend(matches)
        
        if credential_matches:
            findings.append("Requests sensitive information (OTP/PIN/Passwords) or login actions.")
            risk_score += 40.0

        # Cap score at 100
        risk_score = min(risk_score, 100.0)

        return AnalyzerResult(
            analyzer_name="TextAnalyzer",
            risk_score=risk_score,
            findings=findings,
            details={"urgency": urgency_matches, "impersonation": impersonation_matches}
        )
