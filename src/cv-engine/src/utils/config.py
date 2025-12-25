# Configuration for NeuraLens CV Engine

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    
    # YOLO Model Configuration
    YOLO_MODEL_PATH: str = "models/yolov9-c.pt"
    YOLO_CONFIDENCE_THRESHOLD: float = 0.5
    YOLO_IOU_THRESHOLD: float = 0.45
    
    # MediaPipe Configuration
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE: float = 0.5
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE: float = 0.5
    
    # Video Processing
    FRAME_SAMPLING_RATE: int = 5  # Process every Nth frame
    MAX_VIDEO_SIZE_MB: int = 500
    
    # Face Anonymization
    BLUR_KERNEL_SIZE: int = 50
    ANONYMIZATION_METHOD: str = "blur"  # "blur" or "silhouette"
    
    # Behavioral Thresholds
    MOVEMENT_THRESHOLD: float = 0.70
    ATTENTION_THRESHOLD: float = 0.60
    
    # Time Windows (in seconds)
    TIME_WINDOW_SHORT: int = 30
    TIME_WINDOW_MEDIUM: int = 120
    TIME_WINDOW_LONG: int = 300
    
    # Head Pose Thresholds (degrees)
    ON_TASK_YAW_THRESHOLD: int = 30
    ON_TASK_PITCH_THRESHOLD: int = 20
    
    # Storage
    TEMP_UPLOAD_DIR: str = "temp/uploads"
    PROCESSED_FRAMES_DIR: str = "temp/processed"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()

# Ensure directories exist
os.makedirs(settings.TEMP_UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_FRAMES_DIR, exist_ok=True)
