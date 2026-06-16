<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=TruthLens&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=AI-Powered%20Misinformation%20Detector%20for%20Social%20Media&descAlignY=60&descSize=18" width="100%"/>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Groq-AI-FF6B35?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/MV3-Manifest%20V3-green?style=for-the-badge&logo=googlechrome&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platforms-6%20Social%20Media-blueviolet?style=flat-square"/>
  <img src="https://img.shields.io/badge/Detection-Real%20Time-success?style=flat-square"/>
  <img src="https://img.shields.io/badge/AI%20Model-llama--3.1--8b--instant-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/Search%20Grounding-DuckDuckGo-DE5833?style=flat-square"/>
</p>

</div>

---

## 🧠 What is TruthLens?

TruthLens is a **passive AI-powered Chrome extension** that silently scans social media posts in real time, detects misinformation using Groq's LLM, verifies claims with DuckDuckGo search grounding, and blurs flagged content with an explanation overlay — without interrupting your browsing experience.

> No clicks needed. It watches, analyzes, and protects — all in the background.

---

## 🚨 Problem Statement

| Problem | Impact |
|---------|--------|
| Misinformation spreads 6x faster than truth on social media | Millions misled daily |
| No passive, real-time detection tool exists for end users | Users must fact-check manually |
| Fake job postings and scam courses target students & freshers | Financial and career damage |
| Health misinformation goes viral unchecked | Real-world harm |

---

## ✅ Solution

TruthLens runs silently on 6 social media platforms, scanning every post as it loads. When it detects misinformation at 90%+ confidence, it:

1. **Blurs** the post with a dark overlay
2. **Labels** it with category + confidence score
3. **Explains** why it was flagged (one tap)
4. **Verifies** using DuckDuckGo before flagging
5. **Tracks** your weekly exposure stats in the popup dashboard

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension (MV3)                │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Content Scripts (per platform)          │   │
│  │  instagram.js  twitter.js  facebook.js           │   │
│  │  whatsapp.js   linkedin.js  naukri.js            │   │
│  │                                                  │   │
│  │  MutationObserver → DOM Scan → Post Extraction   │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │           queue.js (Debounced Batch Queue)        │   │
│  │  Collects posts → 3s debounce → max 2/batch      │   │
│  │  Tracks weekly stats → chrome.storage.local       │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │         service_worker.js (MV3 Background)       │   │
│  │  chrome.runtime.onMessage → fetch POST /analyze  │   │
│  └──────────────────────┬──────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTP POST localhost:8001
┌─────────────────────────▼───────────────────────────────┐
│                  FastAPI Backend                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              POST /analyze                        │   │
│  │  asyncio.gather → ThreadPoolExecutor              │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │           groq_service.py                         │   │
│  │  Groq(llama-3.1-8b-instant) → JSON response      │   │
│  │  confidence >= 0.90 → verify_claim()              │   │
│  └──────────────────────┬──────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │           search_service.py                       │   │
│  │  DuckDuckGo Search → Claim Grounding              │   │
│  │  Verified as REAL? → Remove flag                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                  blur.js (Result Handler)                 │
│  flagged + confidence >= 0.90 → applyBlur()              │
│  Overlay: Category Label + Show Anyway + Why Flagged?    │
│  Explanation Box + Feedback Buttons                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Detection Categories

| Category | Description | Example |
|----------|-------------|---------|
| `fake_news` | Fabricated news events presented as real | False celebrity death reports |
| `misleading_stats` | Deliberately manipulated numbers or data | "90% of people agree..." with no source |
| `fake_job` | Fraudulent job postings with fake salaries | "₹5LPA fresher job, no skills needed" |
| `health_misinfo` | Dangerous false medical claims | Miracle cure posts |
| `scam_course` | Fake "100% placement guaranteed" ads | "Learn coding in 30 days, guaranteed job" |
| `fake_review` | Obviously fabricated product testimonials | AI-generated 5-star reviews |

---

## 🌐 Supported Platforms

<div align="center">

| Platform | Selector Strategy | Status |
|----------|-------------------|--------|
| 🐦 Twitter / X | `article[data-testid="tweet"]` | ✅ Active |
| 📸 Instagram | `article` (structural) | ✅ Active |
| 💬 WhatsApp Web | `[data-testid="msg-container"]` | ✅ Active |
| 📘 Facebook | `div[data-pagelet]` | ✅ Active |
| 💼 LinkedIn | `.feed-shared-update-v2` | ✅ Active |
| 💼 Naukri | `.jobTuple` | ✅ Active |

</div>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| Extension Framework | Chrome Manifest V3, Vanilla JS |
| DOM Scanning | MutationObserver API |
| Backend | FastAPI (Python 3.11) |
| AI Model | Groq — llama-3.1-8b-instant |
| Search Grounding | DuckDuckGo (via duckduckgo-search) |
| Containerization | Docker |
| Storage | chrome.storage.local |

</div>

---

## 📊 Dashboard

The popup dashboard shows your weekly exposure stats:

- **Posts Scanned** — total posts analyzed
- **Flagged This Week** — number of flagged posts
- **Flag Rate** — percentage of posts flagged
- **By Category** — breakdown with progress bars
- **Reset Button** — clear weekly stats

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Docker (optional)
- Chrome browser
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/venunathan07/TruthLens.git
cd TruthLens

# Create virtual environment
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Run the backend:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
```

### Docker Setup

```bash
# Build image
docker build -t truthlens-api .

# Run container
docker run -d -p 8001:8001 --env-file backend/.env --name truthlens_backend truthlens-api

# Start/stop
docker start truthlens_backend
docker stop truthlens_backend
```

### Extension Setup

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Pin TruthLens from the extensions menu

---

## 📁 Project Structure

```
TruthLens/
├── backend/
│   ├── core/
│   │   └── config.py          # Settings (reads from .env)
│   ├── routers/
│   │   ├── analyze.py         # POST /analyze endpoint
│   │   └── feedback.py        # POST /feedback endpoint
│   ├── schemas/
│   │   └── content.py         # Pydantic models
│   ├── services/
│   │   ├── groq_service.py    # AI analysis + search grounding
│   │   └── search_service.py  # DuckDuckGo claim verification
│   ├── main.py                # FastAPI app + CORS
│   └── requirements.txt
├── extension/
│   ├── background/
│   │   └── service_worker.js  # MV3 service worker
│   ├── content_scripts/
│   │   ├── instagram.js
│   │   ├── twitter.js
│   │   ├── facebook.js
│   │   ├── whatsapp.js
│   │   ├── linkedin.js
│   │   └── naukri.js
│   ├── utils/
│   │   ├── queue.js           # Debounced batch queue + stats
│   │   └── blur.js            # Overlay UI + feedback
│   ├── popup/
│   │   ├── index.html         # Dashboard UI
│   │   └── popup.js           # Stats rendering
│   └── manifest.json          # MV3 manifest
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔒 Privacy

- **No data leaves your device** except to your local backend (localhost:8001)
- **No user accounts** required
- **No tracking** — all stats stored locally in chrome.storage.local
- The extension only reads post text visible on screen

---

## 🚧 Known Limitations

- Requires local backend running (Render deployment coming soon)
- Sports stats posts occasionally trigger false positives
- Rate limited to ~30 posts/minute on free Groq tier

---

## 🗺️ Roadmap

- [ ] Deploy backend on Render (no local server needed)
- [ ] Evidence source links in blur overlay (WHO, Reuters)
- [ ] Multi-language support (Tamil, Hindi)
- [ ] Firefox extension port
- [ ] Confidence threshold slider in settings

---

## 👨‍💻 Author

<div align="center">

**Venunathan Prakash**
B.E. Computer Science — Rajalakshmi Institute of Technology, Chennai (2026)

[![GitHub](https://img.shields.io/badge/GitHub-venunathan07-181717?style=for-the-badge&logo=github)](https://github.com/venunathan07)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-venunathan--prakash-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/venunathan-prakash)
[![Portfolio](https://img.shields.io/badge/Portfolio-venunathan.vercel.app-black?style=for-the-badge&logo=vercel)](https://venunathan.vercel.app)

</div>

---

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>
</div>
