# NeuraLens Quick Start Guide

## 🚀 Getting Started with NeuraLens

This guide will help you get the NeuraLens system up and running for development and testing.

---

## Prerequisites

### Required Software:
- **Python 3.11+** - For CV engine
- **.NET 9 SDK** - For backend API
- **Node.js 22+** - For frontend (future)
- **Docker Desktop** - For containerization
- **Azure CLI** - For Azure deployment
- **Git** - Version control

### Azure Resources (for full deployment):
- Azure OpenAI (GPT-4o)
- Azure Cosmos DB
- Azure Blob Storage
- Azure Container Apps
- Azure AI Agent Service

---

## 📦 Phase 1: Computer Vision Engine (COMPLETED ✅)

The CV engine is the core of NeuraLens. It processes videos and extracts behavioral features.

### 1. Navigate to CV Engine Directory
```bash
cd src/cv-engine
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create Environment File
```bash
# Copy example env file
cp .env.example .env

# Edit .env if needed (defaults should work for local testing)
```

### 5. Run the CV Engine
```bash
# Start FastAPI server
uvicorn src.api.main:app --reload --port 8000
```

### 6. Test the API
```bash
# Health check
curl http://localhost:8000/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2025-01-15T10:30:00Z",
#   "components": {
#     "face_anonymizer": "ready",
#     "pose_estimator": "ready",
#     "movement_calculator": "ready",
#     "attention_calculator": "ready"
#   }
# }
```

### 7. Test Video Processing (Optional)
```bash
# You'll need a sample classroom video
curl -X POST "http://localhost:8000/process-video" \
  -F "file=@path/to/classroom_video.mp4" \
  -F "session_id=test-001"
```

---

## 🔧 Phase 2: Backend API (.NET) - NEXT STEP

### Current Status:
The boilerplate contains creative writer code. We need to:
1. Remove creative writer components
2. Keep Azure AI Agent Service (for XAI)
3. Add new controllers and services

### Steps to Transform Backend:

#### 1. Navigate to Backend Directory
```bash
cd src/ChatApp.WebApi
```

#### 2. Add Required NuGet Packages
```bash
dotnet add package Azure.Storage.Blobs --version 12.19.1
dotnet add package Microsoft.Azure.Cosmos --version 3.38.1
```

#### 3. Create New Services (TO DO)
- `Services/ComputerVisionService.cs` - HTTP client to CV engine
- `Services/BehavioralAnalyticsService.cs` - Aggregate CV outputs
- `Services/RiskScoringEngine.cs` - Calculate risk scores
- `Services/ExplainableAIService.cs` - Use boilerplate's AI Agent

#### 4. Create New Controllers (TO DO)
- `Controllers/BehavioralAnalyticsController.cs`
- `Controllers/VideoController.cs`
- `Controllers/DashboardController.cs`

#### 5. Create Models (TO DO)
- `Models/BehavioralFeatures.cs`
- `Models/RiskAssessment.cs`
- `Models/ClassroomBaseline.cs`

---

## 🎨 Phase 3: Frontend Dashboard - FUTURE

### Current Status:
Frontend still has creative writer UI. Will be replaced with behavioral monitoring dashboard.

### Planned Components:
- Real-time behavioral monitoring view
- Risk indicator timeline visualization
- Classroom activity heatmap
- Individual student risk cards (anonymized)

---

## 🧪 Testing the System

### 1. Test CV Engine Independently
```bash
# Terminal 1: Run CV engine
cd src/cv-engine
uvicorn src.api.main:app --reload --port 8000

# Terminal 2: Test endpoints
curl http://localhost:8000/health
```

### 2. Test Backend API (Once Implemented)
```bash
# Terminal 1: Run backend
cd src/ChatApp.WebApi
dotnet run

# Terminal 2: Test endpoints
curl http://localhost:7001/api/behavioral-analytics/health
```

### 3. Test Full Integration (Future)
```bash
# Terminal 1: CV Engine
cd src/cv-engine
uvicorn src.api.main:app --port 8000

# Terminal 2: Backend API
cd src/ChatApp.WebApi
dotnet run

# Terminal 3: Frontend
cd src/ChatApp.React
npm run dev
```

---

## 🐳 Docker Deployment

### CV Engine Only (Currently Available)
```bash
cd src/cv-engine

# Build image
docker build -t neuralens-cv-engine .

# Run container
docker run -p 8000:8000 neuralens-cv-engine

# Test
curl http://localhost:8000/health
```

### Full System (Future - with Docker Compose)
```bash
# From project root
docker-compose up

# This will start:
# - CV Engine (port 8000)
# - Backend API (port 7001)
# - Frontend (port 5001)
```

---

## ☁️ Azure Deployment

### Prerequisites:
1. Azure subscription
2. Azure CLI installed and logged in
3. Docker Desktop running

### Deploy CV Engine to Azure Container Apps:
```bash
# Login to Azure
az login

# Create resource group
az group create --name neuralens-rg --location swedencentral

# Create container registry
az acr create --resource-group neuralens-rg \
  --name neuralensacr --sku Basic

# Build and push CV engine image
cd src/cv-engine
az acr build --registry neuralensacr \
  --image neuralens-cv-engine:latest .

# Create container app environment
az containerapp env create \
  --name neuralens-env \
  --resource-group neuralens-rg \
  --location swedencentral

# Deploy CV engine
az containerapp create \
  --name neuralens-cv-engine \
  --resource-group neuralens-rg \
  --environment neuralens-env \
  --image neuralensacr.azurecr.io/neuralens-cv-engine:latest \
  --target-port 8000 \
  --ingress external
```

---

## 📊 Sample Data

### Where to Get Classroom Videos:
1. **Create your own**: Record a mock classroom session (ensure consent!)
2. **Public datasets**: Search for educational video datasets
3. **Synthetic data**: Use video editing to create test scenarios

### Privacy Reminder:
- **NEVER** use real classroom footage without proper consent
- **ALWAYS** anonymize faces before sharing
- **DELETE** raw videos after processing

---

## 🔍 Troubleshooting

### CV Engine Issues:

**Problem**: `ModuleNotFoundError: No module named 'mediapipe'`
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Problem**: `Could not load YOLO model`
```bash
# Solution: YOLO will auto-download on first use
# Or manually download to models/yolov9-c.pt
```

**Problem**: `OpenCV error: libGL.so.1: cannot open shared object file`
```bash
# Solution (Linux): Install OpenGL libraries
sudo apt-get install libgl1-mesa-glx
```

### Backend Issues:

**Problem**: `Package 'Azure.Storage.Blobs' not found`
```bash
# Solution: Add package
dotnet add package Azure.Storage.Blobs --version 12.19.1
```

---

## 📚 Additional Resources

### Documentation:
- [NeuraLens README](README.md)
- [CV Engine README](src/cv-engine/README.md)
- [Implementation Progress](IMPLEMENTATION_PROGRESS.md)

### External Resources:
- [MediaPipe Documentation](https://google.github.io/mediapipe/)
- [Ultralytics YOLO](https://docs.ultralytics.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [.NET Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)

---

## 🎯 Current Development Status

### ✅ Completed:
- [x] CV Engine - Face Anonymization
- [x] CV Engine - Pose Estimation
- [x] CV Engine - Movement Calculator
- [x] CV Engine - Attention Calculator
- [x] CV Engine - FastAPI API
- [x] CV Engine - Docker Configuration

### 🚧 In Progress:
- [ ] Backend .NET API transformation
- [ ] Azure AI Agent integration (XAI)

### ⏳ Not Started:
- [ ] Cosmos DB integration
- [ ] Blob Storage integration
- [ ] Frontend Dashboard
- [ ] End-to-end testing
- [ ] Azure deployment
- [ ] Imagine Cup demo video

---

## 💬 Support

For questions or issues:
1. Check [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md)
2. Review error logs
3. Open a GitHub issue

---

**Happy Coding! 🚀**

*Building the future of educational behavioral monitoring, one line of code at a time.*
