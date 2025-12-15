# Bot Interviewer

An AI-powered interview preparation platform that helps candidates practice technical and behavioral interviews through real-time audio conversations. The system adapts to different difficulty levels and provides detailed performance feedback after each session.

## Features

### Core Interview System
- **Adaptive Difficulty**: Easy → Medium → Hard question progression
- **Phase-Based Interview**: Introduction → Technical → Behavioral → Wrap-up
- **Real-Time Audio**: Click-to-toggle microphone with automatic transcription
- **AI Interviewer**: Powered by Groq LLM (llama-3.1-8b-instant)
- **Professional Feedback**: Score (1-10), strengths, and improvement areas

### User Interface
- **Video Call Style**: Full-screen interview session mimicking real interviews
- **Modern Design**: SaaS aesthetic with professional color scheme
- **Responsive Layout**: Mobile-optimized (iOS, Android, Desktop)
- **Alert Dialogs**: Professional exit confirmations instead of browser popups
- **Smooth Animations**: Framer Motion for polished transitions

### Audio Pipeline
- **Transcription**: Deepgram Speech-to-Text with high accuracy
- **TTS**: Deepgram Text-to-Speech for AI responses
- **Recording**: MediaRecorder API with Blob-to-base64 conversion
- **Playback**: Web Audio API with interrupt functionality

## Getting Started

### Prerequisites
- Python 3.10-3.12
- Node.js 18+
- API Keys: Groq + Deepgram

### Backend Setup

Navigate to the backend directory and create a virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Configure environment variables by copying the example file:

```bash
cp ../.env.example ../.env
```

Edit the `.env` file in the project root and add your API keys for Groq and Deepgram. Then start the server:

```bash
python3 main.py
```

The
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3000

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Setup and basic usage
- **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** - Complete feature list and testing guide

## 🏗️ Architecture

### Frontend (React 18 + Next.js 14)
```
Setup Screen → Interview Session → Feedback Report
      ↑_________________↓_________________↓
              Navigation Loop with Home Button
```

**Components:**
- `SetupScreen` - Form: Job description, Resume, Difficulty, Duration
- `InterviewSession` - Full-screen interview with video call UX
- `ReportCard` - Performance feedback with score and improvements
- `useInterviewAudio` - Custom hook for audio recording/playback

**Tech Stack:**
- TypeScript, Tailwind CSS, Framer Motion
- ShadCN UI (AlertDialog, Button)
- Lucide React Icons
- Axios for HTTP

### Backend (FastAPI + Python)
```
User Message
    ↓
/transcribe (Audio → Text)
    ↓
/chat (Generate AI Response)
    ↓
/feedback (Generate Score & Feedback)
```

**Services:**
- `erview_service.py` - Phase machine, difficulty system, anti-hallucination
- `audio_service.py` - Speech-to-text, text-to-speech
- `pdf_service.py` - Resume parsing

**Tech Stack:**
- FastAPI, Uvicorn
- Groq API (LLM), Deepgram API (Audio)
- Python-multipart, Wave

## Interview Flow

1. **Setup** - User provides:
   - Job description
   - Resume (optional)
   - Difficulty level (Easy/Medium/Hard)
   - Duration (5-60 minutes)
### Setup Phase

Users begin by providing
2. **Interview** - 4-phase progression:
   - **Introduction** (Messages 1-2): Warm greeting
   - **Technical** (Messages 3-5): Skill assessment
### Interview Phase

The interview progresses through four stages:

- **Introduction** (Messages 1-2): Opening conversation and rapport building
- **Technical** (Messages 3-5): Skills and knowledge assessment
- **Behavioral** (Messages 6-8): Soft skills evaluation
- **Wrap-up** (Messages 9+): Closing questions and remarks

### Feedback Phase

After completing the interview, candidates receive:

- Performance score on a 1-10 scale
- Home button available at any time to exit and return to setup
- End Interview button to finish the session and view feedback
- New Interview option after viewing feedback

## Technical Capabiliti
### Navigation Home button or "New Interview"

## Smart Features

### Anti-Hallucination
- Mandatory citations for technical claims
- No placeholder text ("*Awaiting...*")
- Short interview detection
- Consistency validation

### Difficulty Adaptation
- **Easy**: Definitions, high-level concepts
- **Medium**: Implementation details, real-world scenarios
- **Hard**: System design, optimization, edge cases
Project
### User Experience
- Click-to-toggle microphone (no hold-to-speak)
- Text input alternative
- Stop AI button (interrupt playback)
- Full scrollable message history
- Sticky timer in header

## 📊 File Structure

```
.
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main controller
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Tailwind + custom
│   ├── src/
│   │   ├── components/interview/
│   │   │   ├── SetupScreen.tsx
│   │   │   ├── InterviewSession.tsx
│   │   │   └── ReportCard.tsx
│   │   ├── hooks/
│   │   │   └── useInterviewAudio.ts
│   │   └── ui/alert-dialog/      # ShadCN component
│   ├── package.json
│   └── tsconfig.json
│
├── .env                          # Environment configuration
└── README.md                     # Project documentation
│   │   ├── interview_service.py
│   │   ├── audio_service.py
│   │   └── pdf_service.py
│  ─ .env                      # API keys
│
├── README.md                     # This file
├── QUICKSTART.md                 # Setup guide
└── IMPLEMENTATION_CHECKLIST.md   # Feature & testing checklist
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PBrowser Support

The application has been tested and works reliably on:

- Chrome/Edge 90 and above
- Safari 14 and above
- Firefox 88 and above

Note that microphone access requires either localhost or HTTPS in production environments.

## Mobile responsiveness

### Browser Support
- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ or .next/
```Deployment

Build the frontend application:

```bash
cd frontend
npm run build
```

The build output can be deployed to platforms like Vercel, Netlify, or any static hosting service.

### Backend Deployment

For production deployment, install a production ASGI server:

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

The backend can be deployed to Railway, Heroku, AWS, or any platform supporting Python applications.

### Environment Configuration

Set the following environment variables in your deployment platform:

**Root .env file:**
- NEXT_PUBLIC_API_URL: Your backend API URL
- FRONTEND_URL: Your frontend domain (for CORS)
- GROQ_API_KEY: Your Groq API key
- DEEPGRAM_API_KEY: Your Deepgram API key
Troubleshooting

### Backend Server Issues

If the backend fails to start, verify your Python version is between 3.10 and 3.12:

```bash
python3 --version
```

Ensure you're using the virtual environment and reinstall dependencies if needed:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Microphone Access Issues

If the microphone isn't working:
- Check browser permissions in Settings > Privacy > Microphone
- Verify you're using localhost or HTTPS (required for production)
- Try opening the application in an incognito or private browsing window

### API Authentication Errors

If you encounter API authentication issues:
- Confirm your API keys are correctly set in the `.env` file
- Test your keys directly on the Groq and Deepgram dashboards
- Check if you've exceeded rate limits on either service

##alytics dashboard
- [ ] Real-time speech activity detection
- [ ] Candidate comparison reports
- [ ] Export feedback as PDF

## Development
The codebase follows standard best practices:
- Type hints in both TypeScript and Python
- ESLint configuration for the frontend
- Modular component architecture
- Descriptive naming conventions throughout


## Author

Zayeem Zaki
