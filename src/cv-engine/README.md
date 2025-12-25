# NeuraLens Computer Vision Engine

Privacy-first computer vision microservice for behavioral analysis in classroom environments.

## Features

- **Face Anonymization**: Gaussian blur or silhouette extraction before any processing
- **Pose Estimation**: MediaPipe Pose with 33 skeletal keypoints
- **Movement Intensity Index**: Tracks fidgeting, position changes, excessive movement
- **Attention Duration Ratio**: Monitors on-task vs off-task behavior via head pose
- **FastAPI REST API**: Easy integration with .NET backend

## Installation

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn src.api.main:app --reload --port 8000
```

### Docker

```bash
# Build image
docker build -t neuralens-cv-engine .

# Run container
docker run -p 8000:8000 neuralens-cv-engine
```

## API Endpoints

### Health Check
```
GET /health
```

### Process Video
```
POST /process-video
Content-Type: multipart/form-data

Parameters:
- file: Video file (MP4, AVI, MOV)
- session_id: Optional session identifier

Returns:
- session_id
- students: List of behavioral features
- processing_time
- frames_processed
- anonymization_stats
```

### Get Processing Status
```
GET /processing-status/{session_id}

Returns:
- status: "processing" | "completed" | "failed"
- progress: 0-100
- message: Status message
```

## Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# YOLO Model
YOLO_MODEL_PATH=models/yolov9-c.pt
YOLO_CONFIDENCE_THRESHOLD=0.5

# MediaPipe
MEDIAPIPE_MIN_DETECTION_CONFIDENCE=0.5
MEDIAPIPE_MIN_TRACKING_CONFIDENCE=0.5

# Processing
FRAME_SAMPLING_RATE=5
MAX_VIDEO_SIZE_MB=500

# Anonymization
BLUR_KERNEL_SIZE=50
ANONYMIZATION_METHOD=blur

# Thresholds
MOVEMENT_THRESHOLD=0.70
ATTENTION_THRESHOLD=0.60
```

## Architecture

```
cv-engine/
├── src/
│   ├── api/
│   │   └── main.py              # FastAPI application
│   ├── preprocessing/
│   │   └── anonymizer.py        # Face anonymization
│   ├── detection/
│   │   └── pose_estimator.py    # MediaPipe Pose
│   ├── features/
│   │   ├── movement_calculator.py
│   │   └── attention_calculator.py
│   └── utils/
│       └── config.py
├── models/
│   └── yolov9-c.pt             # YOLO weights (download separately)
├── Dockerfile
└── requirements.txt
```

## Privacy & Ethics

**CRITICAL**: This engine is designed with privacy-first principles:

1. **Face anonymization runs BEFORE any other processing**
2. **No raw video is stored** (deleted after processing)
3. **Only anonymized frames are kept** (optional, for debugging)
4. **No personally identifiable information** in outputs

## Behavioral Indicators

### Movement Intensity Index (MII)
- Tracks torso displacement frame-to-frame
- Detects fidgeting patterns
- Identifies major position changes
- Compares to classroom baseline

### Attention Duration Ratio (ADR)
- Monitors head orientation (yaw, pitch, roll)
- Calculates on-task vs off-task time
- Tracks focus duration sessions
- Detects distraction events

## Testing

```bash
# Run tests
pytest

# Test with sample video
curl -X POST "http://localhost:8000/process-video" \
  -F "file=@sample_classroom.mp4" \
  -F "session_id=test-session-001"
```

## Performance

- **Latency**: < 2 seconds per frame (target)
- **Throughput**: Processes 30 FPS video at 5 FPS sampling rate
- **Memory**: ~2GB RAM for typical classroom video

## License

MIT License - See LICENSE.md

## Support

For issues or questions, please open a GitHub issue.
