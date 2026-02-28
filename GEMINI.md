# Project Overview: TruthLens Frontend

This project is the frontend application for the "TruthLens - Multimodal Misinformation Detection System." It is a React-based single-page application built with Vite, utilizing Tailwind CSS for styling and Framer Motion for animations to create a dynamic, responsive, and premium dark-mode user interface. 

The frontend recently underwent a UI/UX overhaul to unify the design language across all components (Hero, Features, About, and the Diagnostics Scanner), featuring custom oceanic aesthetics, seamless single-page scrolling without unmounting, and improved global interactivity.

The frontend is designed to interact with a sophisticated backend API (as detailed in `TruthLens_PRD.pdf`) that analyzes various content types (text, images, audio, video, URLs) for misinformation and generates comprehensive credibility reports.

# Backend API Overview: TruthLens

The TruthLens project also includes a robust backend API, "Multimodal Misinformation Detection System," designed to analyze and detect misinformation across various content types.

## Core Purpose

TruthLens is an AI-powered platform that analyzes text, images, audio, video, and URLs to produce structured credibility reports with transparent reasoning, source citations, and ethical AI safeguards. Its core promise is to provide a credibility score, a clear verdict, flagged claims with sources, and an honest explanation of the AI's confidence. The system emphasizes full AI provenance, displaying the exact APIs, specific neural network models, and the complete raw model logic used for each verdict, alongside dedicated visual UI features like the Deepfake Probability meter.

## Key Backend Technologies

*   **API Framework:** FastAPI (Python)
*   **LLM (Reasoning):** Groq (LLAMA-3.3-70b-specdec)
*   **LLM (Vision):** OpenRouter (gpt-4o / Qwen-VL) - strictly tuned for deterministic verification
*   **Audio to Text:** Groq (distil-whisper-large-v3-en)
*   **Fact Check:** Google Fact Check Tools API
*   **URL Scraping:** httpx + BeautifulSoup
*   **Video Processing:** MoviePy + OpenCV
*   **Caching:** In-memory Dict

## Key API Endpoints

The API provides several endpoints for analyzing different content types (All implemented *):

*   `POST /analyze/text`*: Run the Factual Verification Engine on raw text.
*   `POST /analyze/url`*: Scrape and analyze a URL.
*   `POST /analyze/image`*: Analyze an image for AI manipulation.
*   `POST /analyze/audio`*: Transcribe and analyze audio.
*   `POST /analyze/video`*: Extract frames and audio for full analysis.
*   `GET /report/{id}`*: Retrieve a stored report by ID.
*   `GET /health`*: Service health check.
*   `GET /docs`: Auto-generated Swagger UI (FastAPI).

**Note:** Refer to `backend/API_SETUP_GUIDE.md` for information on setting up API keys for external services.

## Technologies Used

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Animation Library:** Framer Motion
*   **Routing:** React Router DOM

## Building and Running the Project

To set up and run the TruthLens frontend application, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run in Development Mode:**
    This command starts the development server with hot-reloading.
    ```bash
    npm run dev
    ```
    The application will typically be accessible at `http://localhost:5173`.

3.  **Build for Production:**
    This command compiles the application into static files for production deployment.
    ```bash
    npm run build
    ```
    The build output will be located in the `dist/` directory.

4.  **Preview Production Build:**
    After building, you can preview the production bundle locally.
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Code Quality:** The project uses ESLint for maintaining code quality and consistency. You can run the linter using:
    ```bash
    npm run lint
    ```
*   **Styling:** Tailwind CSS is used for utility-first styling.
*   **Component-Based Architecture:** The UI is structured using React components, typically found in the `src/components` directory.
