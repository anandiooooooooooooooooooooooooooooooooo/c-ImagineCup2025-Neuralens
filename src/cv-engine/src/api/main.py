# FastAPI Main Application - NeuraLens CV Engine

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import cv2
import numpy as np
import os
import uuid
import aiofiles
from datetime import datetime

from ..preprocessing.anonymizer import FaceAnonymizer
from ..detection.pose_estimator import PoseEstimator, PoseLandmarks
from ..features.movement_calculator import MovementCalculator
from ..features.attention_calculator import AttentionCalculator
from ..utils.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="NeuraLens CV Engine",
    description="Computer Vision Engine for ADHD/ASD Behavioral Monitoring",
    version="1.0.0"
)

# CORS middleware for .NET backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CV components
face_anonymizer = FaceAnonymizer()
pose_estimator = PoseEstimator()
movement_calculator = MovementCalculator()
attention_calculator = AttentionCalculator()

# Pydantic models for request/response
class ProcessingStatus(BaseModel):
    session_id: str
    status: str
    progress: float
    message: str

class BehavioralFeatures(BaseModel):
    student_id: str
    movement_intensity: Dict
    attention_duration: Dict
    timestamp: str

class VideoProcessingResult(BaseModel):
    session_id: str
    students: List[BehavioralFeatures]
    processing_time: float
    frames_processed: int
    anonymization_stats: Dict

# In-memory storage for processing status (use Redis in production)
processing_status_store = {}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "NeuraLens CV Engine",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "process_video": "/process-video",
            "process_frame_batch": "/process-frame-batch"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for orchestration"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "face_anonymizer": "ready",
            "pose_estimator": "ready",
            "movement_calculator": "ready",
            "attention_calculator": "ready"
        }
    }

@app.post("/process-video", response_model=VideoProcessingResult)
async def process_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    session_id: str = None
):
    """
    Process uploaded video for behavioral analysis
    
    Steps:
    1. Save uploaded video
    2. Anonymize faces (privacy first!)
    3. Extract poses from frames
    4. Calculate movement intensity
    5. Calculate attention duration
    6. Return behavioral features
    """
    # Generate session ID if not provided
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Update processing status
    processing_status_store[session_id] = {
        "status": "processing",
        "progress": 0.0,
        "message": "Video uploaded, starting processing..."
    }
    
    try:
        # Save uploaded file
        upload_path = os.path.join(settings.TEMP_UPLOAD_DIR, f"{session_id}_{file.filename}")
        async with aiofiles.open(upload_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
        
        processing_status_store[session_id]["progress"] = 10.0
        processing_status_store[session_id]["message"] = "Video saved, anonymizing faces..."
        
        # Anonymize video
        anonymized_path = os.path.join(settings.PROCESSED_FRAMES_DIR, f"{session_id}_anonymized.mp4")
        anonymization_stats = face_anonymizer.anonymize_video(upload_path, anonymized_path)
        
        processing_status_store[session_id]["progress"] = 30.0
        processing_status_store[session_id]["message"] = "Faces anonymized, extracting poses..."
        
        # Process anonymized video
        cap = cv2.VideoCapture(anonymized_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Extract poses from frames
        pose_sequences = {}  # Dictionary: student_id -> List[PoseLandmarks]
        frame_count = 0
        start_time = datetime.utcnow()
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Sample frames (process every Nth frame)
            if frame_count % settings.FRAME_SAMPLING_RATE == 0:
                timestamp = frame_count / fps
                
                # For MVP, assume single student (student_id = "anonymous_001")
                # In production, use YOLO to detect and track multiple students
                pose = pose_estimator.estimate_pose(frame, person_id=0, timestamp=timestamp)
                
                if pose:
                    student_id = "anonymous_001"
                    if student_id not in pose_sequences:
                        pose_sequences[student_id] = []
                    pose_sequences[student_id].append(pose)
            
            frame_count += 1
            
            # Update progress
            progress = 30.0 + (frame_count / anonymization_stats["total_frames"]) * 50.0
            processing_status_store[session_id]["progress"] = progress
        
        cap.release()
        
        processing_status_store[session_id]["progress"] = 80.0
        processing_status_store[session_id]["message"] = "Calculating behavioral features..."
        
        # Calculate behavioral features for each student
        students_features = []
        
        for student_id, poses in pose_sequences.items():
            # Calculate movement intensity
            movement_result = movement_calculator.calculate_movement_intensity(poses)
            
            # Calculate attention duration
            attention_result = attention_calculator.calculate_attention_duration(poses)
            
            students_features.append(BehavioralFeatures(
                student_id=student_id,
                movement_intensity=movement_result,
                attention_duration=attention_result,
                timestamp=datetime.utcnow().isoformat()
            ))
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Update status to completed
        processing_status_store[session_id]["status"] = "completed"
        processing_status_store[session_id]["progress"] = 100.0
        processing_status_store[session_id]["message"] = "Processing completed successfully"
        
        # Schedule cleanup of temporary files
        background_tasks.add_task(cleanup_temp_files, upload_path, anonymized_path)
        
        return VideoProcessingResult(
            session_id=session_id,
            students=students_features,
            processing_time=processing_time,
            frames_processed=frame_count,
            anonymization_stats=anonymization_stats
        )
    
    except Exception as e:
        processing_status_store[session_id]["status"] = "failed"
        processing_status_store[session_id]["message"] = f"Error: {str(e)}"
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/processing-status/{session_id}", response_model=ProcessingStatus)
async def get_processing_status(session_id: str):
    """Get processing status for a session"""
    if session_id not in processing_status_store:
        raise HTTPException(status_code=404, detail="Session not found")
    
    status_data = processing_status_store[session_id]
    return ProcessingStatus(
        session_id=session_id,
        status=status_data["status"],
        progress=status_data["progress"],
        message=status_data["message"]
    )

@app.post("/process-frame-batch")
async def process_frame_batch(frames_data: List[str], session_id: str = None):
    """
    Process a batch of base64-encoded frames
    (Alternative to video upload for real-time streaming)
    """
    # TODO: Implement frame batch processing
    # Decode base64 frames, anonymize, extract poses, calculate features
    raise HTTPException(status_code=501, detail="Frame batch processing not yet implemented")

async def cleanup_temp_files(*file_paths):
    """Background task to clean up temporary files"""
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error cleaning up {file_path}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
