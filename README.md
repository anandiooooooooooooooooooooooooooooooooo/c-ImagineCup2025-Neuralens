# NeuraLens - ADHD/ASD Early Detection System

[![Imagine Cup 2026](https://img.shields.io/badge/Imagine%20Cup-2026-blue)](https://imaginecup.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Powered by AI](https://img.shields.io/badge/AI-Powered-purple)](https://www.openai.com/)

> **AI-Powered Behavioral Monitoring for Early Detection of ADHD/ASD Risk Indicators in Classroom Environments**

## 🎯 Project Overview

NeuraLens is a behavioral monitoring system designed to help educators identify students who may benefit from professional assessment for ADHD or ASD. Using advanced computer vision and AI, we analyze classroom behavior patterns to detect risk indicators, empowering teachers and school psychologists with actionable comparisons and insights.

**⚠️ NOTE:** This system is **non-diagnostic**. It provides behavioral observations and risk indicators to support professional decision-making.

---

## 🌟 Key Features

### 📊 Behavioral Analytics
- **Movement Intensity Index (MII)**: Tracks fidgeting, frequent position changes, and hyperactivity.
- **Attention Duration Ratio (ADR)**: Measures sustained focus, head orientation, and on-task behavior.
- **Baseline Comparison**: Compares individual student behavior against class averages.

### 🎥 Privacy-First Monitoring
- **Real-Time Detection**: Processes video feeds instantly to provide live feedback.
- **Face Anonymization**: Ensures student privacy by processing data securely.

### 📈 Interactive Dashboard
- **Live Class Monitor**: Watch behavioral metrics in real-time.
- **Risk Analysis**: Visual timelines and scores for different behavioral metrics.
- **Student Insights**: Detailed breakdown of detected behaviors.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TypeScript, CSS Modules
- **Backend / AI Engine**: Python, Flask, MediaPipe (Pose/Face Mesh), YOLOv8 (Object Detection)
- **Database**: SQL / Key-Value Store (Configurable)
- **Infrastructure**: Azure / Local Deployment

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+
- **Python**: v3.9+

### 1. Backend Setup (AI Engine)
Navigate to the backend directory and start the Python server:

```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

### 2. Frontend Setup (Dashboard)
Open a new terminal and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application should now be accessible at `http://localhost:5173` (or the port shown in your terminal).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built for the Microsoft Imagine Cup 2026</b><br>
  <i>Empowering educators with AI-driven insights.</i>
</div>
