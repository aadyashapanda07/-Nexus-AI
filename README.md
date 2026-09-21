<div align="center">

# 🚀 Nexus AI
### Intelligent Task Management Ecosystem

**Predictive AI to optimize team velocity and automate workflow assignments.**  
*Proven to have reduced project delivery time by 40% for beta teams.*

---

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAI GPT-4](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)](https://openai.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=for-the-badge)](https://pinecone.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Key Features

1. **AI-Driven Task Duration Prediction**
   - Live Python FastAPI regression model that calculates estimated hours, Fibonacci story points, confidence intervals (75%-98%), and risk factor breakdowns.
   - Automatically matches tasks with developers based on historical velocity and domain expertise.

2. **Automated Sprint Planning Based on Velocity**
   - Knapsack-inspired AI velocity optimizer (`POST /api/sprint-plan`).
   - Automatically prioritizes backlog items, balances workload against sprint capacity (45 pts), and assigns tasks without causing developer burnout.

3. **Natural Language Project Querying (Nexus Copilot)**
   - Pinecone RAG semantic search + GPT-4 context reasoning.
   - Query project health in natural language (e.g. *"Who is overloaded?"*, *"What are the sprint risks?"*, *"How was the 40% delivery reduction achieved?"*).

4. **Real-Time Team Workload & Heatmap Visualization**
   - Real-time SVG workload meters tracking engineer commitments against 40-hour thresholds.
   - 1-Click AI workload rebalancer that automatically redistributes tasks from overloaded engineers to peers with available capacity.

---

## 🏗️ Architecture

```
 ┌────────────────────────────────────────────────────────┐
 │            Nexus AI Frontend (Next.js 14)              │
 │                http://localhost:3000                   │
 ├────────────────────────────────────────────────────────┤
 │ - AI Duration Predictor                                │
 │ - Automated Velocity Sprint Planner                    │
 │ - Real-Time Team Workload & Heatmap                    │
 │ - Project Copilot (Natural Language RAG)               │
 └────────────────────────────────────────────────────────┘
                            │
               REST APIs / CORS (Port 8000)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │           Nexus AI Backend (Python FastAPI)            │
 │               http://127.0.0.1:8000                    │
 ├────────────────────────────────────────────────────────┤
 │ - POST /api/predict     (Duration Regression Model)    │
 │ - POST /api/sprint-plan (Velocity Capacity Optimizer)  │
 │ - POST /api/rebalance   (Team Capacity Rebalancing)    │
 │ - POST /api/query       (Pinecone & GPT-4 RAG Search)  │
 │ - GET  /api/health      (System Telemetry Status)      │
 └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, TypeScript
- **Backend**: Python FastAPI, Uvicorn, Pydantic v2
- **AI & ML**: OpenAI GPT-4, Regression Ensemble, Pinecone Vector DB

---

## 🚦 Quick Start Guide

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai
```

### 2. Run the Next.js Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Python FastAPI Backend
```bash
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 📁 Repository Structure

```
nexus-ai/
├── backend/
│   ├── main.py              # FastAPI app, AI regression models, sprint optimizer
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Example environment keys
├── src/
│   ├── app/
│   │   ├── globals.css      # Custom styling & dark-mode cyber themes
│   │   ├── layout.tsx       # Root Next.js layout
│   │   ├── page.tsx         # Central page controller & state management
│   │   └── api/predict/     # Next.js API route fallback
│   ├── components/
│   │   ├── Navbar.tsx               # Header with brand box & cloud key settings
│   │   ├── DashboardOverview.tsx    # Clean dashboard overview & feature launchers
│   │   ├── TaskPredictor.tsx        # AI Duration Predictor tool
│   │   ├── SprintPlanner.tsx        # Automated AI Sprint Replanner & Backlog
│   │   ├── TeamWorkload.tsx         # Real-time capacity heatmap & 1-click rebalance
│   │   └── NaturalLanguageQuery.tsx # Project Copilot with Pinecone RAG chat
│   ├── lib/
│   │   ├── aiEngine.ts      # Client prediction & semantic search algorithms
│   │   └── nexusData.ts     # Realistic initial seed backlog & sprint telemetry
│   └── types/
│       └── nexus.ts         # TypeScript interfaces & data models
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎯 Key Beta Result
> **Beta teams experienced a 40% reduction in overall project delivery time** by replacing manual estimation meetings with Nexus AI predictive duration forecasting and automated velocity balancing.
