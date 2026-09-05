import os
from gtts import gTTS
import uuid

class TTSGenerator:
    def __init__(self, output_dir: str = "static/audio"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_audio(self, text: str, lang: str = "en") -> str:
        """
        Generates an MP3 file from text.
        lang: 'en' for English, 'hi' for Hindi
        Returns the path to the generated file.
        """
        if not text:
            return None
            
        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            filename = f"{uuid.uuid4().hex}.mp3"
            filepath = os.path.join(self.output_dir, filename)
            tts.save(filepath)
            return filepath
        except Exception as e:
            print(f"Error generating TTS: {e}")
            return None
