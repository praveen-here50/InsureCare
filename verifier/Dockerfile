FROM python:3.12-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng tesseract-ocr-tam \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download the AI-image model at build time so the container starts offline.
ARG AI_MODEL=haywoodsloan/ai-image-detector-deploy
ENV AI_MODEL=${AI_MODEL} HF_HOME=/models HF_HUB_DISABLE_TELEMETRY=1
RUN python -c "import os; from transformers import AutoImageProcessor, AutoModelForImageClassification as M; m=os.environ['AI_MODEL']; AutoImageProcessor.from_pretrained(m); M.from_pretrained(m)"
ENV HF_HUB_OFFLINE=1

COPY app.py .
RUN useradd --system app && chown -R app /app /models
USER app
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
