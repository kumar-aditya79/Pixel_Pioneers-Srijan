from urllib.parse import urlparse
import re
from app.models.schemas import AnalyzerResult

class LinkAnalyzer:
    def __init__(self):
        # Extremely simplified for MVP
        self.suspicious_tlds = [".xyz", ".top", ".buzz", ".info", ".online", ".club"]
        self.free_hosting = ["blogspot", "wordpress", "wixsite", "weebly"]
        self.url_shorteners = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "goo.gl", "ow.ly"]

    def analyze(self, url: str) -> AnalyzerResult:
        if not url:
            return AnalyzerResult(analyzer_name="LinkAnalyzer", risk_score=0.0, findings=[], details={})

        findings = []
        risk_score = 0.0
        
        try:
            parsed = urlparse(url if "://" in url else f"http://{url}")
            domain = parsed.netloc.lower()

            if any(tld in domain for tld in self.suspicious_tlds):
                findings.append("Uses a suspicious Top Level Domain (TLD) often associated with spam/phishing.")
                risk_score += 40.0
            
            if any(host in domain for host in self.free_hosting):
                findings.append("Hosted on a free subdomain which is commonly abused.")
                risk_score += 30.0

            if any(shortener in domain for shortener in self.url_shorteners):
                findings.append("Uses a URL shortener, obscuring the final destination.")
                risk_score += 20.0
                
            # Basic lookalike detection (e.g. 0 instead of o)
            if re.search(r"[01]", domain) and not domain.isdigit():
                findings.append("Domain contains numbers which might be a typosquatting attempt.")
                risk_score += 15.0
                
        except Exception as e:
            findings.append(f"Failed to parse URL: {str(e)}")
            risk_score += 10.0

        risk_score = min(risk_score, 100.0)

        return AnalyzerResult(
            analyzer_name="LinkAnalyzer",
            risk_score=risk_score,
            findings=findings,
            details={"domain": url}
        )
