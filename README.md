# SkillBridge AI 🚀

**SkillBridge AI** is an intelligent career guidance platform that helps engineering students bridge the gap between academic curriculum and industry requirements. Using advanced AI (Gemini), it analyzes user profiles, generates personalized learning roadmaps, and recommends curated resources (YouTube, Coursera, etc.).

## ✨ Key Features

*   **AI-Driven Career Recommendations**: Analyzes user skills and interests to suggest the best career domains (e.g., AI Engineer, Full Stack Dev).
*   **Gap Analysis**: Visually displays skill gaps between current knowledge and industry standards using a dynamic interactive graph.
*   **Personalized Roadmaps**: Generates week-by-week study plans tailored to the user's available time and semester schedule.
*   **Smart Resource Curation**: Automatically fetches highly-rated YouTube videos and courses for every topic in the roadmap.
*   **Syllabus Integration**: Upload your university syllabus (PDF) to automatically map your coursework to industry skills.
*   **Google Sheets Export**: One-click export of your entire personalized roadmap to Google Sheets for tracking.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
*   **Backend**: FastAPI, Python 3.10
*   **AI & ML**: Google Gemini Pro (Generative AI), Sentence Transformers (Semantic Search)
*   **Cloud & DevOps**: Google Cloud Run, Cloud Build, Docker
*   **Authentication**: Firebase Auth
*   **Integrations**: YouTube Data API, Google Sheets API, Google Drive API

## 🚀 Getting Started

### Prerequisites

*   Node.js 18+
*   Python 3.10+
*   Google Cloud Project with Gemini API enabled
*   Firebase Project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Anishp-cell/SkillBridge-AI.git
    cd SkillBridge-AI
    ```

2.  **Backend Setup**
    ```bash
    # Navigate to root directory (Backend)
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    ```bash
    cd SkillBridge-AI/frontend
    npm install
    ```

### Running Locally

1.  **Start Backend**
    ```bash
    # From root directory
    uvicorn ai.api.app:app --reload
    ```

2.  **Start Frontend**
    ```bash
    # From frontend directory
    npm run dev
    ```
    Open `http://localhost:3000` in your browser.

## ☁️ Deployment

This project is configured for **Google Cloud Run**.

1.  **Backend**:
    ```bash
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/skillbridge-backend .
    gcloud run deploy skillbridge-backend --image gcr.io/YOUR_PROJECT_ID/skillbridge-backend --platform managed --allow-unauthenticated
    ```

2.  **Frontend**:
    ```bash
    cd SkillBridge-AI/frontend
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/skillbridge-frontend .
    gcloud run deploy skillbridge-frontend --image gcr.io/YOUR_PROJECT_ID/skillbridge-frontend --platform managed --allow-unauthenticated
    ```

## 📄 License

This project is licensed under the MIT License.
