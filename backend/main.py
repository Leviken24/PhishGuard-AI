import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

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

# Initialize Gemini Client
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    client = genai.Client(api_key=gemini_api_key)
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

def parse_ai_response(response_text: str) -> dict:
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
        raise HTTPException(status_code=500, detail="Gemini API key not configured. Add GEMINI_API_KEY to .env file.")
    
    features = extract_url_features(req.url)
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"URL to analyze: {req.url}\n\nExtracted Features: {json.dumps(features, indent=2)}",
            config=types.GenerateContentConfig(
                system_instruction=URL_SYSTEM_PROMPT,
            )
        )
        return parse_ai_response(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/email")
async def analyze_email(req: EmailRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API key not configured. Add GEMINI_API_KEY to .env file.")
    
    features = extract_email_features(req.email_text)
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Email text to analyze: {req.email_text}\n\nExtracted Features: {json.dumps(features, indent=2)}",
            config=types.GenerateContentConfig(
                system_instruction=EMAIL_SYSTEM_PROMPT,
            )
        )
        return parse_ai_response(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
