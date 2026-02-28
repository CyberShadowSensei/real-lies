# TruthLens Backend API Setup Guide (Free Tier)

This document provides guidance on setting up the necessary API keys for the TruthLens backend, focusing on free-tier options for hackathon development.

---

## 1. Groq API (for LLM and Whisper)

**Purpose:** Used for fast Large Language Model (LLM) inference (e.g., LLaMA-3.3-70b for text analysis) and high-speed audio-to-text transcription (distil-whisper-large-v3-en). Groq offers a generous free tier for developers.

**Platform:** [Groq Cloud](https://console.groq.com/docs/quickstart)

**How to Obtain API Key:**
1.  Go to [console.groq.com](https://console.groq.com/).
2.  Sign up or log in.
3.  Navigate to the "API Keys" section.
4.  Click "Create New API Key" and follow the instructions.
5.  Copy the generated API key.

**Where to Add:**
*   **File:** `.env` (create this file in the project root if it doesn't exist, by copying `.env.example`).
*   **Variables:**
    ```dotenv
    GROQ_API_KEY_1="YOUR_GROQ_API_KEY_HERE"
    # It is recommended to add multiple keys (if you can obtain them) for key rotation and rate limit handling.
    # GROQ_API_KEY_2="YOUR_SECOND_GROQ_API_KEY"
    # GROQ_API_KEY_3="YOUR_THIRD_GROQ_API_KEY"
    ```
    *Note:* The `backend/config.py` is set up to read `GROQ_API_KEY_1` through `GROQ_API_KEY_9`.

---

## 2. OpenRouter API (for Vision LLM)

**Purpose:** Used to access various Vision Large Language Models (LLMs) (e.g., LLaVA, Qwen-VL, GPT-4o) for image and frame analysis. OpenRouter acts as a unified API for many models, often including free-tier access or generous trial credits.

**Platform:** [OpenRouter](https://openrouter.ai/)

**How to Obtain API Key:**
1.  Go to [openrouter.ai](https://openrouter.ai/).
2.  Sign up or log in.
3.  Navigate to your dashboard or API Keys section (usually found under your profile).
4.  Generate a new API key.
5.  Copy the generated API key.

**Where to Add:**
*   **File:** `.env`
*   **Variables:**
    ```dotenv
    OPENROUTER_API_KEY_1="YOUR_OPENROUTER_API_KEY_HERE"
    # Similar to Groq, multiple keys can be beneficial for rotation.
    # OPENROUTER_API_KEY_2="YOUR_SECOND_OPENROUTER_API_KEY"
    ```
    *Note:* The `backend/config.py` is set up to read `OPENROUTER_API_KEY_1` through `OPENROUTER_API_KEY_9`.

---

## 3. Google Fact Check Tools API

**Purpose:** Used to search for existing fact-checks on claims.

**Platform:** [Google Cloud Console](https://console.cloud.google.com/)

**How to Obtain API Key:**
1.  Go to [console.cloud.google.com](https://console.cloud.google.com/).
2.  Sign up or log in. You may need to enable billing, but the Fact Check Tools API itself has a free tier for basic usage.
3.  **Create a new project** (or select an existing one).
4.  In the Google Cloud Console, use the search bar to find "Fact Check Tools API" and enable it for your project.
5.  Navigate to "APIs & Services" > "Credentials".
6.  Click "Create Credentials" > "API Key".
7.  Copy the generated API key.
8.  **Important:** Restrict your API key to prevent unauthorized use. Go to "Edit API Key", and under "API restrictions", select "Restrict key" and choose "Fact Check Tools API" from the dropdown. You can also add "Application restrictions" if deployed to a specific domain.

**Where to Add:**
*   **File:** `.env`
*   **Variable:**
    ```dotenv
    GOOGLE_FACT_CHECK_API_KEY="YOUR_GOOGLE_FACT_CHECK_API_KEY_HERE"
    ```

---

## Final Steps:

1.  **Create `.env` file:** Copy the contents of `.env.example` into a new file named `.env` in the root of your project (`E:\escape da vinci\.env`).
2.  **Populate Keys:** Paste your actual API keys into the `.env` file, replacing the "YOUR_API_KEY_HERE" placeholders.
3.  **Never commit `.env`:** Ensure your `.env` file is in your `.gitignore` to prevent sensitive keys from being committed to version control.
4.  **Restart Backend:** If the backend is running, restart it to load the new environment variables.

By following these steps, your TruthLens backend should be able to authenticate with the necessary external APIs.
