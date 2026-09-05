from app.analyzers.text_analyzer import TextAnalyzer
from app.analyzers.link_analyzer import LinkAnalyzer
from app.analyzers.apk_analyzer import APKAnalyzer
from app.core.engine import RiskEngine
from typing import Optional

class InputRouter:
    def __init__(self):
        self.text_analyzer = TextAnalyzer()
        self.link_analyzer = LinkAnalyzer()
        self.apk_analyzer = APKAnalyzer()
        self.risk_engine = RiskEngine()

    def route_and_analyze(self, text: Optional[str] = None, url: Optional[str] = None, file_bytes: Optional[bytes] = None, filename: Optional[str] = None):
        results = []

        if text:
            results.append(self.text_analyzer.analyze(text))
        
        if url:
            results.append(self.link_analyzer.analyze(url))

        if file_bytes and filename:
            results.append(self.apk_analyzer.analyze(file_bytes, filename))

        risk_score, risk_level = self.risk_engine.evaluate(results)

        return results, risk_score, risk_level
