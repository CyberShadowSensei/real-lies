# TruthLens System Architecture

## Overview
TruthLens is a multimodal misinformation detection system designed for high-throughput, accurate analysis of varied content types including video, audio, images, URLs, and raw text. The architecture prioritizes modularity, resilience through API key rotation, and a unified data model for cross-modal consistency.

## Core Components

### 1. Unified API Layer (FastAPI)
The backend is built on FastAPI, utilizing asynchronous request handling for all analysis pipelines. It exposes specialized endpoints for each content type, ensuring that failures in one modality (e.g., video processing) do not impact the availability of others (e.g., text analysis).

### 2. Multimodal Processing Pipelines

#### A. Video Analysis Pipeline
- **Extraction:** Utilizes OpenCV and MoviePy to decouple auditory and visual components.
- **Auditory Processing:** Transcribes extracted audio using the Groq Whisper (distil-whisper-large-v3-en) API.
- **Visual Processing:** Samples frames at 1 FPS and performs artifact analysis using Vision LLMs via OpenRouter.
- **Integration:** Aggregates findings to detect discrepancies between audio content and visual presentation (e.g., deepfakes).

#### B. Audio Analysis Pipeline
- **Transcription:** Direct integration with Groq Whisper for near real-time Speech-to-Text.
- **Analysis:** Evaluates transcripts for logical inconsistencies and known misinformation patterns.

#### C. Visual Analysis Pipeline (Images & Frames)
- **Forensics:** Analyzes uploaded images and video frames for digital manipulation and AI generation artifacts (temporal inconsistencies, anatomical errors, background warping) using highly specific forensic prompts.
- **Aggressive Scoring:** The heuristic engine is configured to polarize results—aggressively flagging systemic visual artifacts to instantly penalize credibility and identify deepfakes.
- **Deterministic Reliability:** Utilizes a strict constant temperature of 0.0 to guarantee reproducible, stable results while employing robust JSON markdown-stripping.

#### D. Factual Verification Engine (URL/Text / Voice)
- **Ingestion:** Scrapes web content using httpx and BeautifulSoup4 with robust cleanup logic. Alternatively, ingests STT output from Whisper.
- **Reasoning:** Employs LLaMA-3.3-70b-specdec (via Groq) to extract claims, identify logical fallacies, and perform strict logical validation penalizing manipulation.

### 3. Verification & Aggregation Engine
- **Fact-Check Integration:** Automatically queries the Google Fact Check Tools API for extracted claims to provide external validation.
- **Weighted Scoring:** A heuristic-based aggregator combines visual evidence, factual verification, and semantic confidence into a standardized Unified Report Schema.

### 4. Infrastructure Utilities

#### API Key Rotation (KeyRotator)
To handle the stringent rate limits of high-performance LLM providers, TruthLens implements a round-robin key rotation strategy.
- **Cooldown Management:** Automatically detects 429 Rate Limit errors and places keys into a temporary cooldown state, ensuring continuous service availability.
- **Scalability:** Supports horizontal scaling of API keys across multiple providers.

#### In-Memory Caching & Storage
- **Performance:** Caches repetitive LLM queries to reduce latency and API costs.
- **Persistence:** Employs a hackathon-optimized in-memory store for session-based report retrieval via UUID.

## Data Model: Unified Report Schema
Every analysis, regardless of input type, results in a consistent JSON structure. This ensures the frontend remains decoupled from the specific processing logic of each modality.

```json
{
  "id": "uuid-v4",
  "verdict": "string",
  "credibility_score": "int (0-100)",
  "confidence": "float (0-1)",
  "summary": "string",
  "claims_analyzed": [
    {
      "claim": "string",
      "verdict": "string",
      "source": "url",
      "explanation": "string"
    }
  ],
  "red_flags": ["string"],
  "frame_analysis": { ... },
  "ethical_notes": { ... },
  "input_type": "string",
  "processing_path": "string",
  "api_used": "string",
  "analysis_model": "string",
  "raw_response": "string (optional)",
  "timestamp": "ISO8601"
}
```

## Security & Ethics
- **Privacy:** Adheres to a strict no-retention policy for user-uploaded media beyond the active analysis session.
- **Transparency:** Every verdict includes a confidence score and a bias warning to remind users of the limitations of automated AI analysis.
