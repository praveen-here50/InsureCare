"""Document verifier: OCR, error level analysis and an AI-image classifier for claim documents.

Runs next to the backend (docker compose service `verifier`). Everything happens on this machine:
no document is sent to an outside service. The backend calls POST /analyze once per page image.
"""
import io
import os

import numpy as np
import pytesseract
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, ImageChops, UnidentifiedImageError
from transformers import AutoImageProcessor, AutoModelForImageClassification

MODEL_ID = os.environ.get("AI_MODEL", "haywoodsloan/ai-image-detector-deploy")
OCR_LANGS = os.environ.get("OCR_LANGS", "eng+tam")
MAX_PIXELS = 40_000_000  # refuse decompression bombs

Image.MAX_IMAGE_PIXELS = MAX_PIXELS
torch.set_num_threads(max(1, (os.cpu_count() or 2) // 2))

processor = AutoImageProcessor.from_pretrained(MODEL_ID)
model = AutoModelForImageClassification.from_pretrained(MODEL_ID).eval()
# Index of the "AI-generated" label, whatever the model calls it.
AI_INDEX = next(i for i, label in model.config.id2label.items() if label.lower() in {"artificial", "ai", "fake", "generated"})

app = FastAPI(title="InsureCare document verifier")


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_ID}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...), ocr: bool = True):
    try:
        image = Image.open(io.BytesIO(await file.read()))
        image.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as e:
        raise HTTPException(status_code=400, detail=f"Not a readable image: {e}") from e
    rgb = image.convert("RGB")
    return {
        "text": pytesseract.image_to_string(rgb, lang=OCR_LANGS, timeout=60) if ocr else "",
        "aiProbability": ai_probability(rgb),
        "ela": error_level(rgb),
        "model": MODEL_ID,
    }


def ai_probability(rgb: Image.Image) -> float:
    """Probability (0-1) that the image was produced by an image generator."""
    with torch.no_grad():
        logits = model(**processor(images=rgb, return_tensors="pt")).logits
    return round(float(torch.softmax(logits, dim=-1)[0, AI_INDEX]), 4)


def error_level(rgb: Image.Image) -> dict:
    """Error level analysis: re-save as JPEG and measure how unevenly the picture changes.

    An untouched scan or photo changes fairly evenly. A pasted or retouched area often
    stands out as a small region with a much higher error than the rest of the page.
    Returns the share of the page in that high-error tail and how far it stands out.
    """
    small = rgb.copy()
    small.thumbnail((1600, 1600))
    buf = io.BytesIO()
    small.save(buf, "JPEG", quality=90)
    resaved = Image.open(io.BytesIO(buf.getvalue()))
    diff = np.asarray(ImageChops.difference(small, resaved).convert("L"), dtype=np.float32)
    # Score 16x16 blocks so a single noisy pixel does not count as an edit.
    h, w = (diff.shape[0] // 16) * 16, (diff.shape[1] // 16) * 16
    if h == 0 or w == 0:
        return {"hotShare": 0.0, "contrast": 0.0}
    blocks = diff[:h, :w].reshape(h // 16, 16, w // 16, 16).mean(axis=(1, 3))
    median = float(np.median(blocks)) + 0.5
    hot = blocks > median * 6
    return {"hotShare": round(float(hot.mean()), 4), "contrast": round(float(blocks.max() / median), 2)}
