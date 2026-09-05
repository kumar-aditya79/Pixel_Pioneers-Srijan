from typing import List
from app.models.schemas import AnalyzerResult

class RiskEngine:
    def __init__(self):
        pass

    def evaluate(self, results: List[AnalyzerResult]) -> tuple[float, str]:
        if not results:
            return 0.0, "Low"
            
        # For this MVP, we simply take the maximum score across all analyzers
        # A more complex engine would use weighted averages.
        max_score = max(result.risk_score for result in results)
        
        # Boost score slightly if multiple analyzers found issues
        analyzers_with_issues = sum(1 for r in results if r.risk_score > 20)
        if analyzers_with_issues > 1:
            max_score = min(max_score + (analyzers_with_issues * 5), 100.0)

        if max_score >= 80:
            level = "Critical"
        elif max_score >= 50:
            level = "High"
        elif max_score >= 25:
            level = "Medium"
        else:
            level = "Low"

        return max_score, level
