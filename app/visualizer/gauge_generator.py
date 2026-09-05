import os
from PIL import Image, ImageDraw, ImageFont
import uuid
import math

class GaugeGenerator:
    def __init__(self, output_dir: str = "static/images"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_gauge(self, score: float) -> str:
        """
        Draws a simple risk gauge (0 to 100).
        """
        width, height = 400, 250
        img = Image.new("RGB", (width, height), "white")
        draw = ImageDraw.Draw(img)

        # Draw gauge arc (background)
        bbox = [50, 50, 350, 350] # Bounding box for the full circle
        draw.arc(bbox, start=180, end=360, fill="lightgray", width=30)
        
        # Color based on score
        if score < 25:
            color = "green"
        elif score < 75:
            color = "orange"
        else:
            color = "red"

        # Draw filled arc based on score
        # 180 degrees mapping to 0-100 score
        end_angle = 180 + (score / 100.0) * 180
        draw.arc(bbox, start=180, end=end_angle, fill=color, width=30)

        # Draw needle (simple line from center)
        center = (200, 200)
        angle_rad = math.radians(end_angle)
        needle_length = 120
        # Calculate needle end point
        nx = center[0] + needle_length * math.cos(angle_rad)
        ny = center[1] + needle_length * math.sin(angle_rad)
        
        draw.line([center, (nx, ny)], fill="black", width=5)
        draw.ellipse([center[0]-10, center[1]-10, center[0]+10, center[1]+10], fill="black")

        # Text
        text = f"Risk: {int(score)}%"
        # Try to load a font, otherwise use default
        try:
            # Arial is usually available on Windows, but let's use default if it fails
            font = ImageFont.truetype("arial.ttf", 30)
        except:
            font = ImageFont.load_default()
            
        draw.text((150, 210), text, fill="black")

        filename = f"{uuid.uuid4().hex}.png"
        filepath = os.path.join(self.output_dir, filename)
        img.save(filepath)
        return filepath
