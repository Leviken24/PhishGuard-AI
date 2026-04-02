# PhishGuard AI
Explainable Phishing Detection based on extracted signals + Google Gemini AI.

## Screenshots
<!-- Add screenshots here -->

## How it works
This tool extracts key features from URLs (like suspicious TLDs, length, IP usage, bit.ly detection) and Emails (urgency language, sender mismatch, suspicious attachments) **before** sending a structural prompt to Google Gemini (e.g. Gemini 2.5 Flash). Gemini then returns a verdict, confidence score, risk factors, safe signals, and a plain-English explanation.

## Setup

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Configure your `GEMINI_API_KEY` in the `.env` file.
4. Run locally: `uvicorn main:app --reload`

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start Vite dev server: `npm run dev`
