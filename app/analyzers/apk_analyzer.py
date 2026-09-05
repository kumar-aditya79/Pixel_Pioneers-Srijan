import hashlib
import zipfile
import io
import re
from app.models.schemas import AnalyzerResult

class APKAnalyzer:
    def __init__(self):
        self.dangerous_permissions = [
            "android.permission.READ_SMS",
            "android.permission.RECEIVE_SMS",
            "android.permission.SEND_SMS",
            "android.permission.READ_CONTACTS",
            "android.permission.READ_CALL_LOG",
            "android.permission.SYSTEM_ALERT_WINDOW", # Screen overlay
            "android.permission.BIND_ACCESSIBILITY_SERVICE"
        ]

    def analyze(self, file_bytes: bytes, filename: str) -> AnalyzerResult:
        if not file_bytes:
            return AnalyzerResult(analyzer_name="APKAnalyzer", risk_score=0.0, findings=[], details={})

        findings = []
        risk_score = 0.0
        
        # 1. Calculate SHA-256 (static analysis identifier)
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()
        details = {"sha256": sha256_hash}
        findings.append(f"File SHA-256: {sha256_hash[:10]}...")

        if not filename.lower().endswith(".apk"):
            findings.append(f"File {filename} is not an APK.")
            return AnalyzerResult(analyzer_name="APKAnalyzer", risk_score=0.0, findings=findings, details=details)

        # 2. Extract AndroidManifest.xml (Simplified Hackathon MVP approach)
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                if "AndroidManifest.xml" in z.namelist():
                    manifest_data = z.read("AndroidManifest.xml")
                    # Note: AndroidManifest in an APK is binary XML (AXML). 
                    # For a true parse, we need androguard or axmlparser.
                    # For the hackathon MVP, we can just regex the binary string for permission names.
                    # It's hacky but works for demo purposes.
                    manifest_str = manifest_data.decode('utf-8', errors='ignore')
                    
                    found_dangerous = []
                    for perm in self.dangerous_permissions:
                        if perm in manifest_str:
                            found_dangerous.append(perm.split(".")[-1])
                            risk_score += 15.0
                    
                    if found_dangerous:
                        findings.append(f"Suspicious permissions requested: {', '.join(found_dangerous)}")
                        # Boost score if multiple dangerous permissions
                        if len(found_dangerous) >= 3:
                            risk_score += 30.0
                else:
                    findings.append("No AndroidManifest.xml found in APK. Suspicious structure.")
                    risk_score += 50.0
        except zipfile.BadZipFile:
            findings.append("Invalid or corrupted APK file (Bad Zip).")
            risk_score += 20.0
        except Exception as e:
            findings.append(f"Error analyzing APK structure: {str(e)}")

        risk_score = min(risk_score, 100.0)

        return AnalyzerResult(
            analyzer_name="APKAnalyzer",
            risk_score=risk_score,
            findings=findings,
            details=details
        )
