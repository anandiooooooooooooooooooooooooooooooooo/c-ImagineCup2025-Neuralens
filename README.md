# NeuraLens - ADHD/ASD Early Detection System

[![Microsoft Imagine Cup 2025](https://img.shields.io/badge/Imagine%20Cup-2025-blue)](https://imaginecup.microsoft.com/)
[![Azure](https://img.shields.io/badge/Azure-Powered-0078D4)](https://azure.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

> **AI-Powered Behavioral Monitoring for Early Detection of ADHD/ASD Risk Indicators in Classroom Environments**

## 🎯 Project Overview

NeuraLens is a **non-diagnostic** behavioral monitoring system that helps educators identify students who may benefit from professional assessment for ADHD or ASD. Using computer vision and AI, we analyze classroom behavior patterns to detect risk indicators, empowering teachers and school psychologists with actionable insights.

**⚠️ CRITICAL: This system does NOT diagnose medical conditions.** All outputs are framed as "behavioral observations" or "risk indicators" that require professional follow-up.

---

## 🌟 Key Features

### 🎥 Privacy-First Computer Vision
- **Face Anonymization**: All faces are blurred/silhouetted before processing
- **Anonymous Student IDs**: No personally identifiable information stored
- **Secure Processing**: Video data deleted after analysis (30-day max retention)

### 📊 Behavioral Analytics
- **Movement Intensity Index (MII)**: Tracks fidgeting, position changes, excessive movement
- **Attention Duration Ratio (ADR)**: Measures sustained focus and on-task behavior
- **Baseline Comparison**: Individual behavior compared to classroom norms
- **Real-Time Monitoring**: Immediate feedback during class sessions

### 🧠 Explainable AI
- **Plain-Language Explanations**: No technical jargon for educators
- **Actionable Recommendations**: Specific observation strategies for teachers
- **Pattern Recognition**: Identifies consistent behavioral indicators over time
- **Azure AI Agent Service**: Contextualizes findings with educational insights

### 📈 Interactive Dashboard
- **Risk Timeline Visualization**: Track behavioral patterns over days/weeks
- **Classroom Activity Heatmap**: Spatial distribution of student activity
- **Individual Risk Cards**: Anonymized student profiles with key indicators
- **Exportable Reports**: Generate summaries for parent-teacher conferences

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend Dashboard (React/Blazor)                      │
│  - Real-time behavioral monitoring                      │
│  - Risk indicator visualizations                        │
│  - Classroom heatmaps & timelines                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Backend API (.NET Aspire / C#)                         │
│  - Video ingestion & orchestration                      │
│  - Behavioral feature aggregation                       │
│  - Risk scoring engine (rule-based + ML)                │
│  - Explainable AI integration                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Computer Vision Engine (Python/FastAPI)                │
│  - YOLO v8/v9: Multi-student detection & tracking       │
│  - MediaPipe: Pose estimation & head orientation        │
│  - Movement Intensity Calculator                        │
│  - Attention Duration Calculator                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────┬──────────────────┬──────────────────┐
│ Azure Cosmos DB  │ Azure Blob       │ Azure AI Agent   │
│ - Behavioral     │ Storage          │ Service          │
│   baselines      │ - Anonymized     │ - Pattern        │
│ - Risk scores    │   frames         │   analysis       │
│ - Time-series    │ - Processing     │ - Explanations   │
│   metrics        │   artifacts      │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **.NET 9 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 22+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Azure CLI** - [Install](https://aka.ms/install-azcli)
- **Azure Developer CLI (azd)** - [Install](https://aka.ms/install-azd)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/anandiooooooooooooooooooooooooooooooooo/neuralens-imaginecup-2025.git
   cd neuralens-imaginecup-2025
   ```

2. **Configure Azure Resources**
   
   Create `appsettings.Development.json` in `src/NeuraLens.AppHost/`:
   ```json
   {
     "Azure": {
       "SubscriptionId": "<Your Azure Subscription ID>",
       "ResourceGroup": "neuralens-rg",
       "Location": "swedencentral",
       "CredentialSource": "InteractiveBrowser"
     },
     "ConnectionStrings": {
       "openAI": "https://<your-resource>.openai.azure.com/",
       "cosmosDb": "https://<your-resource>.documents.azure.com:443/",
       "blobStorage": "https://<your-resource>.blob.core.windows.net/"
     }
   }
   ```

3. **Install Python Dependencies (CV Engine)**
   ```bash
   cd src/cv-engine
   pip install -r requirements.txt
   ```

4. **Run the Application**
   
   **Option A: Visual Studio 2022**
   - Open `src/NeuraLens.sln`
   - Set `NeuraLens.AppHost` as startup project
   - Press F5

   **Option B: .NET CLI**
   ```bash
   cd src/NeuraLens.AppHost
   dotnet run
   ```

5. **Access the Dashboard**
   - Frontend: `https://localhost:5001`
   - Backend API: `https://localhost:7001`
   - CV Engine: `http://localhost:8000`

---

## 📊 Behavioral Indicators Explained

### Movement Intensity Index (MII)
**What we detect:**
- Frequent position changes (shifting in seat)
- Standing up without permission
- Fidgeting behaviors
- Excessive body movement vs. peers

**Technical approach:**
- MediaPipe Pose tracks 33 skeletal keypoints
- Frame-to-frame displacement calculation
- Aggregation over time windows (30s, 2min, 5min)
- Comparison to classroom baseline (median movement)

**Output example:**
```json
{
  "movement_intensity_score": 0.82,
  "threshold": 0.70,
  "status": "elevated",
  "baseline_deviation": +0.35,
  "event_count": 12,
  "time_window": "5min"
}
```

### Attention Duration Ratio (ADR)
**What we detect:**
- Head frequently not facing board/teacher
- Short duration of sustained focus
- Looking around classroom excessively
- Off-task visual behavior

**Technical approach:**
- MediaPipe Face Mesh estimates head pose (pitch, yaw, roll)
- "On-task zone" defined as ±30° yaw from forward-facing
- Percentage calculation: on-task time vs. off-task time
- Longest continuous attention span tracking

**Output example:**
```json
{
  "attention_ratio": 0.45,
  "threshold": 0.60,
  "status": "below_threshold",
  "baseline_deviation": -0.22,
  "longest_focus_duration": "45s",
  "average_focus_duration": "18s"
}
```

---

## 🔒 Privacy & Ethics

### Data Protection Measures
✅ **Face blurring** (Gaussian blur, 50px kernel) before any processing  
✅ **Anonymous student IDs** (UUID, no PII linkage)  
✅ **Metadata stripping** (location, school name, etc.)  
✅ **Raw video deletion** after processing (or encrypted, 30-day max)  
✅ **No video footage** accessible via dashboard  

### Compliance Standards
- **FERPA** (Family Educational Rights and Privacy Act)
- **GDPR** (General Data Protection Regulation, if applicable)
- **Data Retention**: Maximum 90 days
- **Right to Deletion**: Implemented via API
- **Parental Consent**: Workflow documented (out of scope for MVP)

### Ethical Boundaries
⚠️ **NO DIAGNOSTIC LANGUAGE** in UI or outputs  
⚠️ **ALWAYS** frame as "behavioral observations" or "risk indicators"  
⚠️ **REQUIRE** professional follow-up for any concerns  
⚠️ **TRANSPARENT** about system limitations  

---

## 🛠️ Technology Stack

### Backend
- **.NET 9** with Aspire orchestration
- **C# 12** for backend services
- **Azure OpenAI GPT-4o** for explainable AI
- **Azure Cosmos DB** for time-series behavioral data
- **Azure Blob Storage** for anonymized frames
- **Azure Container Apps** for deployment

### Computer Vision Engine
- **Python 3.11+** with FastAPI
- **YOLO v8/v9** for student detection & tracking
- **MediaPipe** for pose estimation & face mesh
- **OpenCV** for video preprocessing
- **NumPy/Pandas** for feature calculation

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Chart.js** for data visualization
- **TailwindCSS** (optional) for styling
- **WebRTC** for live camera streaming (future)

### Azure Services
- **Azure AI Agent Service** - Behavioral reasoning & explanations
- **Azure OpenAI** - GPT-4o for natural language generation
- **Azure Cosmos DB** - NoSQL database for behavioral metrics
- **Azure Blob Storage** - Anonymized video frame storage
- **Azure Container Apps** - Microservices deployment
- **Azure Log Analytics** - System telemetry & monitoring

---

## 📁 Project Structure

```
neuralens-imaginecup-2025/
├── src/
│   ├── NeuraLens.AppHost/          # .NET Aspire orchestration
│   ├── NeuraLens.WebApi/           # Backend API (C#)
│   │   ├── Controllers/
│   │   │   ├── BehavioralAnalyticsController.cs
│   │   │   ├── VideoController.cs
│   │   │   └── DashboardController.cs
│   │   ├── Services/
│   │   │   ├── BehavioralAnalyticsService.cs
│   │   │   ├── RiskScoringEngine.cs
│   │   │   ├── ExplainableAIService.cs
│   │   │   └── ComputerVisionService.cs
│   │   └── Models/
│   │       ├── BehavioralFeatures.cs
│   │       ├── RiskAssessment.cs
│   │       └── ClassroomBaseline.cs
│   ├── NeuraLens.React/            # Frontend dashboard
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── BehavioralDashboard.tsx
│   │   │   │   ├── RiskTimeline.tsx
│   │   │   │   ├── ClassroomHeatmap.tsx
│   │   │   │   ├── StudentRiskCard.tsx
│   │   │   │   └── VideoUploader.tsx
│   │   │   └── services/
│   │   │       └── apiClient.ts
│   ├── cv-engine/                  # Python CV microservice
│   │   ├── src/
│   │   │   ├── preprocessing/
│   │   │   │   ├── video_loader.py
│   │   │   │   ├── frame_sampler.py
│   │   │   │   └── anonymizer.py
│   │   │   ├── detection/
│   │   │   │   ├── yolo_detector.py
│   │   │   │   └── pose_estimator.py
│   │   │   ├── features/
│   │   │   │   ├── movement_calculator.py
│   │   │   │   └── attention_calculator.py
│   │   │   └── api/
│   │   │       └── main.py
│   │   ├── models/
│   │   │   └── yolov9-c.pt
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── NeuraLens.ServiceDefaults/  # Shared service configurations
├── infra/                          # Azure Bicep templates
├── .github/workflows/              # CI/CD pipelines
├── README.md
└── LICENSE.md
```

---

## 🧪 Testing & Validation

### Sample Data Requirements
- 5+ classroom videos (15-30 min each)
- Multiple students visible per video
- Various activities: lecture, group work, independent study
- Different age groups: elementary, middle school

### Validation Metrics
- **Detection Accuracy**: IoU > 0.7 for pose estimation
- **Baseline Stability**: Converges after 5 min observation
- **Processing Latency**: < 2 seconds per frame
- **Privacy Compliance**: 100% face anonymization (manual audit)

### Edge Cases Handled
✅ Student occlusion (blocking each other)  
✅ Poor lighting conditions  
✅ Camera angle variations  
✅ Different classroom sizes  

---

## 🚢 Azure Deployment

### Prerequisites
- Azure subscription with sufficient credits
- Docker Desktop running
- Azure CLI and azd authenticated

### Deployment Steps

1. **Login to Azure**
   ```bash
   azd auth login
   az login --use-device-code
   ```

2. **Deploy Infrastructure & Code**
   ```bash
   azd up
   ```
   
   **Recommended Region**: `swedencentral` (for Azure AI Agent Service availability)

3. **Load Sample Data** (Optional)
   ```bash
   cd src/data
   # Run data loading notebook
   ```

4. **Access Deployed App**
   - Dashboard URL will be displayed after deployment
   - API endpoint: `https://<app-name>.azurecontainerapps.io`

---

## 📖 Usage Guide

### For Teachers

1. **Upload Classroom Video**
   - Navigate to "Upload Video" page
   - Select video file (MP4, AVI, MOV)
   - Enter session details (class name, date, activity type)
   - Click "Process Video"

2. **View Real-Time Dashboard**
   - Monitor student behavioral indicators live
   - Check risk timeline for patterns over time
   - Review classroom activity heatmap

3. **Generate Reports**
   - Select student(s) from anonymized list
   - Choose date range
   - Export PDF report for parent-teacher conferences

### For School Psychologists

1. **Analyze Behavioral Patterns**
   - Review risk indicator trends over weeks/months
   - Compare individual students to classroom baselines
   - Read AI-generated explanations for context

2. **Identify Students for Assessment**
   - Filter students by risk level (HIGH, MEDIUM, LOW)
   - Review specific behavioral indicators (MII, ADR)
   - Access actionable observation recommendations

3. **Professional Referral**
   - Use system outputs as **preliminary observations only**
   - Conduct in-person assessments
   - Refer to licensed clinicians for diagnosis

---

## 🎓 Research Foundation

This system is grounded in established behavioral science research:

- **ADHD Behavioral Markers**: Excessive movement, short attention spans, impulsivity
- **ASD Behavioral Markers**: Repetitive movements, atypical social engagement, restricted focus
- **Classroom Observation Protocols**: Standardized methods adapted for AI analysis

**Key References:**
- "Automated ADHD Detection Using Video-Based Features" (Various studies)
- "Behavioral Patterns in ASD: Movement and Attention Analysis"
- "Privacy-Preserving Computer Vision in Educational Settings"

---

## 🏆 Microsoft Imagine Cup 2025

### Why NeuraLens Stands Out

1. **Privacy-First Design**: Face anonymization before any processing
2. **Explainable AI**: Not just risk scores, but WHY and WHAT TO DO
3. **Non-Diagnostic**: Clear ethical boundaries, empowers educators
4. **Real-Time**: Immediate feedback, not retrospective analysis
5. **Scalable**: Cloud-native Azure architecture
6. **Evidence-Based**: Indicators grounded in behavioral science

### Social Impact

- **Early Intervention**: Identify at-risk students before academic struggles escalate
- **Equitable Access**: Bring behavioral screening to under-resourced schools
- **Teacher Empowerment**: Provide educators with data-driven insights
- **Reduce Stigma**: Objective, non-judgmental behavioral observations

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

---

## 🔗 Resources

- [Azure AI Agent Service Documentation](https://learn.microsoft.com/en-us/azure/ai-studio/)
- [.NET Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [Semantic Kernel Documentation](https://learn.microsoft.com/en-us/semantic-kernel/)
- [MediaPipe Documentation](https://google.github.io/mediapipe/)
- [Ultralytics YOLO Documentation](https://docs.ultralytics.com/)

---

## 📧 Contact

**Project Team**: NeuraLens Development Team  
**Imagine Cup 2025 Submission**  

For questions or support, please open an issue on GitHub.

---

<div align="center">

**Built with ❤️ for educators and students worldwide**

*Empowering early detection, one classroom at a time.*

</div>
