# InGPT — All-in-One Conversational AI Voice Assistant

> *"Your AI. Your Voice. Your Conversation."*

**InGPT** is a production-oriented, full-stack conversational AI assistant that offers natural, real-time voice and text conversations. Designed with an emphasis on simplicity, calm elegance, and instantaneous responses, InGPT features an original visual identity, an audio-reactive central Voice Orb, seamless automatic language detection across all 22 Eighth Schedule Indian languages and world languages, persistent SQLite conversation history, and live tool integrations (weather and search).

---

## Visual & Interaction Design

- **Original InGPT Logo**: An abstract continuous infinity-orbit and flowing sound-wave vector graphic rendered in soft blue (`#8DA8DE`), silver-white (`#F0F4FA`), and restrained lavender (`#D4CCE8`).
- **Signature Voice Orb**: An organic blue-white sphere powered by pure CSS gradients and Web Audio API amplitude physics.
  - **Idle**: Gentle floating animation with subtle ambient lighting.
  - **Listening**: Reacts to real microphone amplitude via Web Audio API `AnalyserNode`, dynamically expanding and contracting.
  - **Thinking**: Restrained harmonic breathing luminescence.
  - **Speaking**: Organic harmonic pulses responding directly to AI audio playback.
- **Signature Mouse Effect**: Soft blue-white radial glow that follows the cursor smoothly on desktop; automatically disabled on touchscreens and respects `prefers-reduced-motion`.
- **Homepage Simplicity**: Generous whitespace, ash-white palette (`#FAFAF9`), centered Voice Orb, status indicator ("Ready when you are", "Listening", "Thinking", "Speaking"), and a compact bottom control dock ("Ask InGPT", voice mic, mute, end session).
- **No Language Dropdowns**: Language selection is 100% automatic based on the spoken or typed input.

---

## Multilingual Coverage

### 22 Eighth Schedule Indian Languages (Full Support)
InGPT automatically identifies the script and language of messages and answers in the exact authentic language and script:
1. **Assamese** (অসমীয়া)
2. **Bengali** (বাংলা)
3. **Bodo** (बर’)
4. **Dogri** (डोगरी)
5. **Gujarati** (ગુજરાતી)
6. **Hindi** (हिन्दी)
7. **Kannada** (ಕನ್ನಡ)
8. **Kashmiri** (कॉशुर / کٲشُر) — *RTL Perso-Arabic & Devanagari*
9. **Konkani** (कोंकणी)
10. **Maithili** (मैथिली)
11. **Malayalam** (മലയാളം)
12. **Manipuri / Meitei** (মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ)
13. **Marathi** (मराठी)
14. **Nepali** (नेपाली)
15. **Odia** (ଓଡ଼ିଆ)
16. **Punjabi** (ਪੰਜਾਬੀ / پنجابی)
17. **Sanskrit** (संस्कृतम्)
18. **Santali** (ᱥᱟᱱᱛᱟᱲᱤ) — *Ol Chiki*
19. **Sindhi** (سنڌي / सिन्धी) — *RTL Perso-Arabic & Devanagari*
20. **Tamil** (தமிழ்)
21. **Telugu** (తెలుగు)
22. **Urdu** (اردو) — *RTL Perso-Arabic*

### Transliterated & Code-Switching Languages
Supports conversational code-switching (e.g. **Hinglish**, **Tanglish**, **Teluglish**) without forcing translation into English.

### World Languages & RTL Support
Comprehensive coverage for Spanish, French, German, Japanese, Chinese, Arabic, Russian, Portuguese, Italian, Korean, and Hebrew with native `dir="rtl"` layout alignment for right-to-left scripts.

---

## Live Connected Services

- **Live Weather API**: Powered by Open-Meteo with global geocoding, real-time temperature, humidity, wind speed, and conditions (Free, zero API key required).
- **Live Search & Fact Retrieval**: Powered by DuckDuckGo Instant Answers and Wikipedia APIs for up-to-date factual queries and definitions.
- **Local Time & Timezone Service**: Accurate real-time local date and time calculations.

---

## Architecture & Technology Stack

```
voice ai/
├── client/                     # Frontend (React 18 + Vite)
│   ├── public/
│   │   └── favicon.svg         # InGPT original vector favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Top navigation (Menu, Brand, Settings)
│   │   │   ├── Logo.jsx            # Original InGPT infinity-orbit SVG logo
│   │   │   ├── Orb.jsx             # Signature audio-reactive Voice Orb
│   │   │   ├── BottomControls.jsx  # Mic, Mute, End, Text input, Send
│   │   │   ├── MouseGlow.jsx       # Smooth radial soft blue-white glow
│   │   │   ├── TranscriptDrawer.jsx# Slide-up conversation transcript
│   │   │   ├── MenuDrawer.jsx      # Left drawer (New chat, History, Clear)
│   │   │   ├── SettingsModal.jsx   # Voice, audio output, connection status
│   │   │   ├── AboutModal.jsx      # Features and privacy overview
│   │   │   └── Toast.jsx           # Non-intrusive notifications
│   │   ├── hooks/
│   │   │   ├── useAudioVisualizer.js # Web Audio API AnalyserNode calculations
│   │   │   └── useVoiceRealtime.js   # OpenAI Realtime WebRTC + Web Speech fallback
│   │   └── styles/
│   │       ├── index.css           # Tokens, ash-white themes, RTL handling
│   │       ├── orb.css             # Liquid organic blue-white sphere & states
│   │       └── controls.css        # Rounded inputs, buttons, responsive docks
│   └── vite.config.js
├── server/                     # Backend (Node.js + Express)
│   ├── db/
│   │   └── database.js         # SQLite persistent storage (sql.js Wasm)
│   ├── routes/
│   │   ├── health.js           # GET /api/health
│   │   ├── realtime.js         # POST /api/realtime/session (OpenAI Realtime WebRTC credentials)
│   │   ├── chat.js             # POST /api/chat (Multi-turn text, tools, language adaptation)
│   │   ├── conversations.js    # CRUD /api/conversations (Persistent history)
│   │   └── tools.js            # Live weather, search, and language detection
│   ├── services/
│   │   ├── aiService.js        # OpenAI Chat/Responses API + tools + local intelligent fallback
│   │   ├── realtimeService.js  # Ephemeral WebRTC session token generator
│   │   ├── languageService.js  # 22 Indian 8th Schedule languages registry & detection
│   │   ├── weatherService.js   # Open-Meteo live weather client
│   │   └── searchService.js    # Live search client
│   ├── middleware/
│   │   ├── security.js         # Helmet, CORS, and Express rate limiting
│   │   └── errorHandler.js     # Safe structured error handling
│   └── index.js                # Express entry point & client static hosting
├── tests/                      # Automated test suite
│   ├── backend.test.js         # SQLite CRUD and conversation persistence
│   ├── language.test.js        # Language and RTL unit tests
│   └── languages_coverage.js   # All 22 Indian 8th Schedule languages validation
├── .env.example
├── package.json
└── README.md
```

---

## Setup & Running Locally

### Prerequisites
- **Node.js**: v18.0.0 or newer (v20+ recommended)
- **npm**: v9.0.0 or newer

### 1. Installation
Clone or navigate to the project directory and install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to configure your settings:
```ini
PORT=5000
NODE_ENV=development

# Core AI Credentials
# (Optional: If omitted, InGPT runs in Adaptive Fallback mode using Web Speech API + intelligent local engine)
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI Models
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
OPENAI_VOICE=alloy

# Persistent Storage
DATABASE_PATH=./data/ingpt.db
```

### 3. Build & Run

#### Option A: Production Mode (Recommended)
Build the frontend and run the Express server:
```bash
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

#### Option B: Full Development Mode (Concurrent Server & Client)
```bash
npm run dev
```
- Client runs on `http://localhost:3000` (with Vite hot reloading and proxy to backend).
- Server runs on `http://localhost:5000`.

---

## Running Automated Tests

Run the test suites:
```bash
# Run backend and language unit tests
npm test

# Run 22 Indian 8th Schedule languages coverage validation
node tests/languages_coverage.js

# Verify frontend bundle delivery
node tests/verify_frontend.js
```

---

## Realtime Voice Connection Architecture

1. **Ephemeral Client Credentials**:
   - The frontend requests a session token from `POST /api/realtime/session`.
   - The backend requests an ephemeral client key from OpenAI (`POST https://api.openai.com/v1/realtime/sessions`) using the server-side `OPENAI_API_KEY`.
   - The permanent secret key is **never** exposed to the client.
2. **WebRTC Peer Connection**:
   - The browser initiates `RTCPeerConnection` and attaches the user's microphone audio track.
   - An `oai-events` data channel is created for bi-directional event streaming.
   - The SDP offer is exchanged with `https://api.openai.com/v1/realtime`.
   - The remote audio track from OpenAI plays directly through the browser with ultra-low latency.
   - Local and remote audio streams feed directly into `AudioContext` and `AnalyserNode` to drive real-time Voice Orb physics.
3. **Adaptive Fallback Mode**:
   - If no `OPENAI_API_KEY` is configured, InGPT automatically switches to Adaptive Fallback mode using browser `SpeechRecognition` and `SpeechSynthesis`.
   - The app remains 100% interactive, conversational, and testable out of the box.

---

## Security & Privacy

- **No Secret Exposure**: All API keys and secrets stay securely on the Node.js backend.
- **Audio Lifecycle**: Microphone tracks are requested strictly upon user interaction and immediately stopped upon ending the session.
- **Rate Limiting**: Integrated `express-rate-limit` prevents brute-force abuse (120 req/min/IP).
- **Security Headers**: Configured with `helmet` and clean CORS policies.
- **Persistent Storage**: SQLite database file stored locally in `./data/ingpt.db` without storing sensitive passwords or credentials.

---

## License

MIT License. Designed and developed for the InGPT Voice AI Assistant project.
