# NeuraLens - IoT Edge AI Vision Analytics Dashboard

A modern, real-time dashboard for monitoring and managing Azure IoT Edge devices with AI-powered computer vision capabilities.

## 🏗️ Architecture

This project implements the following Azure services architecture:

```
Camera → Edge Device (Azure IoT Edge) → Azure IoT Hub → Azure Functions → Azure SQL/Cosmos DB → Dashboard
         ├── MediaPipe
         └── PyTorch/ONNX Runtime
```

## 📁 Project Structure

```
NeuraLens/
├── backend/                    # C# .NET 8 Web API
│   └── NeuraLens.Api/
│       ├── Controllers/        # API endpoints
│       ├── Models/             # Data models
│       ├── Services/           # Azure service integrations
│       └── Program.cs          # Application entry point
│
└── frontend/                   # React TypeScript
    └── src/
        ├── components/         # Reusable UI components
        ├── pages/              # Page components
        ├── services/           # API client
        └── types/              # TypeScript interfaces
```

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm
- Azure subscription (optional, demo mode available)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/NeuraLens.Api
   ```

2. Update `appsettings.json` with your Azure credentials (optional):
   ```json
   {
     "Azure": {
       "IoTHub": {
         "ConnectionString": "YOUR_IOT_HUB_CONNECTION_STRING"
       },
       "BlobStorage": {
         "ConnectionString": "YOUR_BLOB_STORAGE_CONNECTION_STRING"
       },
       "CosmosDb": {
         "ConnectionString": "YOUR_COSMOS_DB_CONNECTION_STRING"
       }
     }
   }
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (optional):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:5173`

## 🔌 Azure Services Integration

### Azure IoT Hub
- Device twin management
- Cloud-to-device messaging
- Telemetry ingestion

### Azure Blob Storage
- Detection image storage
- Feature vector storage
- ML model artifacts

### Azure Cosmos DB
- Telemetry data storage
- Detection results
- Alert management

### Azure Functions (Future)
- Event-driven processing
- Alert triggers
- Report generation

## 📊 Features

- **Real-time Dashboard**: Live metrics and statistics
- **Device Management**: Monitor and control IoT Edge devices
- **AI Detection Viewer**: Browse detected objects with confidence scores
- **Alert System**: Severity-based alerts with resolution workflow
- **Responsive Design**: Works on desktop and mobile

## 🎨 Tech Stack

### Backend
- C# .NET 8
- ASP.NET Core Web API
- Azure SDK for .NET
- Swagger/OpenAPI

### Frontend
- React 18 with TypeScript
- Vite build tool
- Recharts for data visualization
- Lucide React icons
- Date-fns for date formatting
- Axios for API calls

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/{id}` | Get device details |
| POST | `/api/devices/{id}/command` | Send command to device |
| GET | `/api/detections` | List detections |
| GET | `/api/alerts` | List alerts |
| PATCH | `/api/alerts/{id}/read` | Mark alert as read |

## 🔐 Security

- CORS configured for frontend origins
- Azure AD authentication (coming soon)
- HTTPS enforcement in production

## 📄 License

MIT License
