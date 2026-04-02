import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic

from feature_extractor import extract_url_features, extract_email_features

load_dotenv()

app = FastAPI(title="PhishGuard AI API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic Client
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
if anthropic_api_key:
    client = anthropic.Anthropic(api_key=anthropic_api_key)
else:
    client = None

class URLRequest(BaseModel):
    url: str

class EmailRequest(BaseModel):
    email_text: str

URL_SYSTEM_PROMPT = """You are a cybersecurity expert specializing in phishing detection. You will receive extracted features from a URL. Analyze them and return ONLY valid JSON in this exact format:
{
  "verdict": "SAFE" | "SUSPICIOUS" | "PHISHING",
  "confidence_score": <integer 0-100>,
  "risk_factors": ["<specific reason 1>", "<specific reason 2>"],
  "safe_signals": ["<specific safe indicator 1>"],
  "explanation": "<2-3 sentence plain English explanation of your verdict>"
}
Be specific. Name the exact features that triggered your decision. Do not add any text outside the JSON."""

EMAIL_SYSTEM_PROMPT = """You are a cybersecurity expert specializing in phishing email detection. You will receive extracted text features from an email. Analyze and return ONLY valid JSON:
{
  "verdict": "SAFE" | "SUSPICIOUS" | "PHISHING",
  "confidence_score": <integer 0-100>,
  "risk_factors": ["<specific reason>"],
  "safe_signals": ["<specific safe signal>"],
  "explanation": "<2-3 sentence plain English explanation>"
}
Be specific about linguistic and structural red flags. No text outside JSON."""

def parse_claude_response(response_text: str) -> dict:
    try:
        # Sometimes LLMs wrap JSON in markdown blocks
        clean_text = response_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        return json.loads(clean_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")

@app.post("/analyze/url")
async def analyze_url(req: URLRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env file.")
    
    features = extract_url_features(req.url)
    
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=URL_SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": f"URL to analyze: {req.url}\n\nExtracted Features: {json.dumps(features, indent=2)}"}
            ]
        )
        return parse_claude_response(response.content[0].text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/email")
async def analyze_email(req: EmailRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured. Add ANTHROPIC_API_KEY to .env file.")
    
    features = extract_email_features(req.email_text)
    
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=EMAIL_SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": f"Email text to analyze: {req.email_text}\n\nExtracted Features: {json.dumps(features, indent=2)}"}
            ]
        )
        return parse_claude_response(response.content[0].text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
