# NOVA AI Web App

A responsive Hindi/English web AI companion using the supplied avatar, browser speech recognition, browser text-to-speech, and Gemini + OpenAI API routing.

## Run locally
1. Install Node.js 20 or newer.
2. Open a terminal in this folder:
   ```bash
   cd server
   npm install
   ```
3. Copy `.env.example` to `server/.env` (or create `server/.env`) and add your provider keys:
   ```env
   GEMINI_API_KEY=...
   OPENAI_API_KEY=...
   PORT=8787
   ```
4. Start:
   ```bash
   npm start
   ```
5. Open `http://localhost:8787`.

The app and API are served from the same server. Do not put provider keys in browser JavaScript or publish `.env`.

## Features
- Responsive desktop/mobile web UI.
- User-provided avatar image.
- Hindi + English chat prompt.
- Auto provider: Gemini first, ChatGPT fallback.
- Manual Gemini / ChatGPT selection.
- Browser speech output; optional automatic spoken replies.
- Browser microphone speech-to-text (Chrome/Edge support varies; requires HTTPS or localhost).
- Starter quick prompts and conversation clear.

## Not yet included
This is a first web version, not a deployed public website. It does not yet have real-time animated lip-sync, background listening, user accounts, saved memory, or real phone/app actions. Those need separate integrations and user permissions. For production, add authentication, rate limiting, HTTPS, privacy disclosures, and secure hosting.
