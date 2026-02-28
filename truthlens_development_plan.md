## TruthLens Development Plan

### Phase 0: Core Infrastructure & Setup (Estimated: 2.5 hours)
1.  **Task 0.1: Project Scaffolding and Environment Setup**
    *   Create `backend/` directory structure.
    *   Set up `requirements.txt` with essential libraries (FastAPI, Uvicorn, httpx, Pydantic, MoviePy, OpenCV-Python, etc.).
    *   Create `.env.example` documenting necessary environment variables (API keys, etc.).
    *   Create `config.py` for loading environment variables.
    *   **Estimate:** 1 hour
2.  **Task 0.2: API Key Rotation Utility**
    *   Implement `utils/key_rotator.py` with basic round-robin logic and a placeholder for simplified cooldown handling.
    *   **Estimate:** 1 hour
3.  **Task 0.3: Caching Utility**
    *   Implement `utils/cache.py` with a simple in-memory dictionary-based cache.
    *   **Estimate:** 0.5 hours
4.  **Task 0.4: Pydantic Models & Unified Report Schema**
    *   Define all request/response models in `models.py`, focusing on the unified report schema first.
    *   **Estimate:** 1 hour

### Phase 1: Video Analysis (Estimated: 3.5 hours)
*   **Priority:** Highest
1.  **Task 1.1: Implement `video_service.py`**
    *   Handle file upload, extract audio, extract frames (e.g., 1 frame per second).
    *   Integrate Groq Whisper API for audio transcription.
    *   Integrate OpenRouter Vision LLM for frame analysis (simplified prompt for artifact citation).
    *   Utilize key rotator and cache.
    *   **Estimate:** 2 hours
2.  **Task 1.2: Implement `aggregator.py` Logic for Video**
    *   Logic to combine transcription, frame analysis results, and potential fact-checking.
    *   Generate initial unified report schema for video.
    *   **Estimate:** 0.5 hours
3.  **Task 1.3: Implement `/analyze/video` Endpoint**
    *   Create route in `routers/analyze.py`.
    *   Integrate `video_service` and `aggregator`. Ensure async.
    *   **Estimate:** 0.5 hours
4.  **Task 1.4: Frontend Integration for Video**
    *   Update frontend to upload video files to the new endpoint and display a placeholder report.
    *   **Estimate:** 0.5 hours

### Phase 2: Audio Analysis (Estimated: 2.0 hours)
*   **Priority:** High
1.  **Task 2.1: Implement `audio_service.py`**
    *   Handle file upload, integrate Groq Whisper API for transcription.
    *   Utilize key rotator and cache.
    *   **Estimate:** 1 hour
2.  **Task 2.2: Integrate Audio into `aggregator.py`**
    *   Logic to process transcribed audio, potentially call Groq LLM for initial text analysis.
    *   Generate unified report schema for audio.
    *   **Estimate:** 0.5 hours
3.  **Task 2.3: Implement `/analyze/audio` Endpoint**
    *   Create route in `routers/analyze.py`.
    *   Integrate `audio_service` and `aggregator`. Ensure async.
    *   **Estimate:** 0.25 hours
4.  **Task 2.4: Frontend Integration for Audio**
    *   Update frontend to upload audio files.
    *   **Estimate:** 0.25 hours

### Phase 3: URL & Text Analysis (Estimated: 2.5 hours)
*   **Priority:** Medium
1.  **Task 3.1: Implement `url_service.py` & `text_service.py`**
    *   `url_service.py`: Scraping with `httpx`/`BeautifulSoup`.
    *   `text_service.py`: Sending text to Groq LLM for analysis.
    *   Utilize key rotator and cache.
    *   **Estimate:** 1.5 hours
2.  **Task 3.2: Integrate URL/Text into `aggregator.py`**
    *   Logic to combine scraping and LLM analysis.
    *   Generate unified report schema.
    *   **Estimate:** 0.5 hours
3.  **Task 3.3: Implement `/analyze/url` and `/analyze/text` Endpoints**
    *   Create routes in `routers/analyze.py`.
    *   Integrate services and aggregator. Ensure async.
    *   **Estimate:** 0.25 hours
4.  **Task 3.4: Frontend Integration for URL/Text**
    *   Update frontend for URL input and Text input.
    *   **Estimate:** 0.25 hours

### Phase 4: Image Analysis (Estimated: 1.5 hours)
*   **Priority:** Lowest
1.  **Task 4.1: Implement `image_service.py`**
    *   Handle file upload, integrate OpenRouter Vision LLM.
    *   Utilize key rotator and cache.
    *   **Estimate:** 1 hour
2.  **Task 4.2: Integrate Image into `aggregator.py`**
    *   Logic to process image analysis results.
    *   Generate unified report schema.
    *   **Estimate:** 0.25 hours
3.  **Task 4.3: Implement `/analyze/image` Endpoint**
    *   Create route in `routers/analyze.py`.
    *   Integrate service and aggregator. Ensure async.
    *   **Estimate:** 0.125 hours
4.  **Task 4.4: Frontend Integration for Image**
    *   Update frontend for image upload.
    *   **Estimate:** 0.125 hours

### Phase 5: Remaining Backend & Supporting Tasks (Estimated: 1.5 hours)
1.  **Task 5.1: Implement `factcheck_service.py`**
    *   Integrate Google Fact Check Tools API.
    *   **Estimate:** 0.5 hours
2.  **Task 5.2: Implement `GET /report/{id}` Endpoint**
    *   Create route in `routers/report.py`.
    *   Implement a simple in-memory dictionary for report storage (hackathon-scope).
    *   **Estimate:** 0.5 hours
3.  **Task 5.3: Implement `GET /health` Endpoint**
    *   Create route in `main.py` or `routers/analyze.py`.
    *   **Estimate:** 0.25 hours
4.  **Task 5.4: FastAPI App Setup (`main.py`)**
    *   Basic app configuration, CORS, etc.
    *   **Estimate:** 0.25 hours

**Total Estimated Time: 13.5 hours**
*(This is slightly over the 12-hour target, indicating a need for aggressive focus and potential simplification during execution.)*

---

### Risky or Unclear PRD Requirements:

*   **API Key Rotation & Rate Limiting:** Implementing a robust, multi-key rotation with effective "429 cooldown handling" for Groq and OpenRouter within the tight timeline is a significant technical challenge. A simplified approach may be necessary, potentially impacting reliability under heavy load.
*   **Vision LLM Prompt Engineering for Artifact Citation:** The requirement to "force specific artifact citation — never allow vague 'this looks AI generated' outputs" is highly dependent on prompt sensitivity and the LLM's consistent adherence. Crafting prompts that guarantee specific, structured citations across diverse image types is complex and may require iterative tuning.
*   **Unified Report Schema Enforcement:** Ensuring every field in the unified report schema is accurately populated for all input types (video, audio, text, URL, image), especially for edge cases or partial failures, will demand meticulous implementation and error handling. Defining behavior for fields like `frame_analysis` on non-video inputs or `claims_analyzed` on non-textual inputs needs clear, consistent logic.
*   **Independent Module Functionality:** The mandate that "Every module must be independently functional — if one fails, others still work" is challenging when services must integrate via an aggregator. Robust error handling and graceful degradation will be critical to prevent cascading failures.
*   **Frontend Synchronization:** The instruction "Never break the frontend — whenever backend changes affect the API contract, immediately output the corresponding frontend patch" implies a very tight feedback loop. Significant backend API contract changes might require substantial frontend modifications, which could be time-consuming.

---

## Work Done and Functionality

The TruthLens project is now fully functional and implements all phases of the development plan.

### Achievements:
- **Core Infrastructure:** Robust FastAPI backend with API key rotation, round-robin load balancing, and simple in-memory caching.
- **Multimodal Analysis:** Complete end-to-end pipelines for:
    - **Video:** Audio transcription (Groq Whisper) + Frame-by-frame visual analysis (OpenRouter Vision).
    - **Audio:** High-fidelity transcription and content analysis using Groq.
    - **Image:** Deepfake and AI manipulation detection using state-of-the-art Vision LLMs.
    - **URL/Text:** Web scraping followed by deep logical analysis of claims using LLMs.
- **Fact-Checking Integration:** Automated search against the Google Fact Check Tools API for all identified claims across all media types.
- **Unified Reporting:** Every analysis generates a structured `UnifiedReportSchema` containing verdicts, credibility scores, confidence levels, and specific red flags.
- **Persistence:** Implementation of a hackathon-ready in-memory database to store and retrieve reports by UUID.
- **Modern UI:** A dynamic React frontend that handles multi-part file uploads, real-time analysis feedback, and detailed visualization of AI-generated reports.

### How it Functions:
1. **Input:** The user provides a Video, Audio, Image, URL, or raw Text through the React frontend.
2. **Processing:** The backend receives the request, selects an available API key, and routes the content through specialized services:
    - Videos are split into audio and frames.
    - Audio is transcribed.
    - Images/Frames are analyzed for visual artifacts.
    - Text/Scraped content is analyzed for logical fallacies and misinformation.
3. **Verification:** Identified claims are automatically cross-referenced with the Google Fact Check API.
4. **Aggregation:** Heuristics and LLM reasoning combine visual, auditory, and factual evidence into a single report.
5. **Output:** The report is saved to the internal database and returned to the user, displaying a detailed breakdown of the content's credibility in the Verification Center.

