from pydantic import BaseModel, Field
from typing import List, Optional

class AnalyzerResult(BaseModel):
    analyzer_name: str
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Risk score from 0 to 100")
    findings: List[str]
    details: dict = {}

class AnalysisRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    # For file uploads, we use Form data in FastAPI, but this schema represents the logical payload

class FraudExplanation(BaseModel):
    summary: str
    fraud_type: str
    risk_level: str
    confidence: str
    evidence: List[str]
    recommended_action: str
    explanation: str

class FinalReport(BaseModel):
    explanation: FraudExplanation
    risk_score: float
    risk_level: str
    audio_url_en: Optional[str] = None
    audio_url_hi: Optional[str] = None
    gauge_image_url: Optional[str] = None
