import pytest
from app.core.router import InputRouter
import os
import zipfile
import io

def create_dummy_apk(manifest_content: str) -> bytes:
    """Helper to create a dummy APK in memory for testing."""
    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, 'w') as zf:
        zf.writestr("AndroidManifest.xml", manifest_content)
    return mem_zip.getvalue()

def test_benign_message():
    router = InputRouter()
    results, score, level = router.route_and_analyze(text="Hey, are we still meeting for lunch today?")
    assert level == "Low"
    assert score < 20

def test_phishing_link():
    router = InputRouter()
    results, score, level = router.route_and_analyze(
        text="URGENT: Your account is suspended. Click here to verify.",
        url="http://bank-verification-xyz.top/login"
    )
    assert level in ["High", "Critical"]
    assert score >= 50

def test_malicious_apk():
    router = InputRouter()
    # Dummy manifest with dangerous permissions
    manifest = """<manifest>
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    </manifest>"""
    dummy_apk = create_dummy_apk(manifest)
    
    results, score, level = router.route_and_analyze(file_bytes=dummy_apk, filename="wedding_invite.apk")
    
    assert level in ["High", "Critical"]
    # 3 dangerous perms = 15*3 + 30 (bonus) = 75
    assert score >= 75
