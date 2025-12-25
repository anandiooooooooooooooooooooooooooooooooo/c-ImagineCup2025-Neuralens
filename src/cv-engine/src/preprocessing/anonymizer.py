# Face Anonymization Module - Privacy First!

import cv2
import numpy as np
import mediapipe as mp
from typing import Tuple, List
from ..utils.config import settings

class FaceAnonymizer:
    """
    Anonymizes faces in video frames using Gaussian blur or silhouette extraction.
    CRITICAL: This runs BEFORE any other processing to ensure privacy.
    """
    
    def __init__(self, method: str = None):
        """
        Initialize face anonymizer
        
        Args:
            method: "blur" or "silhouette". Defaults to settings.ANONYMIZATION_METHOD
        """
        self.method = method or settings.ANONYMIZATION_METHOD
        self.blur_kernel_size = settings.BLUR_KERNEL_SIZE
        
        # Initialize MediaPipe Face Detection
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=1,  # 1 for full range detection
            min_detection_confidence=0.5
        )
    
    def anonymize_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, int]:
        """
        Anonymize all faces in a single frame
        
        Args:
            frame: Input frame (BGR format)
            
        Returns:
            Tuple of (anonymized_frame, num_faces_detected)
        """
        if frame is None or frame.size == 0:
            return frame, 0
        
        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        results = self.face_detection.process(rgb_frame)
        
        if not results.detections:
            return frame, 0
        
        anonymized_frame = frame.copy()
        num_faces = len(results.detections)
        
        # Process each detected face
        for detection in results.detections:
            bbox = self._get_bounding_box(detection, frame.shape)
            
            if self.method == "blur":
                anonymized_frame = self._apply_blur(anonymized_frame, bbox)
            elif self.method == "silhouette":
                anonymized_frame = self._apply_silhouette(anonymized_frame, bbox)
        
        return anonymized_frame, num_faces
    
    def _get_bounding_box(self, detection, frame_shape: Tuple[int, int, int]) -> Tuple[int, int, int, int]:
        """
        Extract bounding box coordinates from detection
        
        Returns:
            Tuple of (x1, y1, x2, y2)
        """
        h, w, _ = frame_shape
        bbox = detection.location_data.relative_bounding_box
        
        # Convert relative coordinates to absolute
        x1 = int(bbox.xmin * w)
        y1 = int(bbox.ymin * h)
        x2 = int((bbox.xmin + bbox.width) * w)
        y2 = int((bbox.ymin + bbox.height) * h)
        
        # Add padding for better coverage
        padding = 20
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(w, x2 + padding)
        y2 = min(h, y2 + padding)
        
        return x1, y1, x2, y2
    
    def _apply_blur(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Apply Gaussian blur to face region
        """
        x1, y1, x2, y2 = bbox
        
        # Extract face region
        face_region = frame[y1:y2, x1:x2]
        
        if face_region.size == 0:
            return frame
        
        # Apply Gaussian blur
        kernel_size = (self.blur_kernel_size, self.blur_kernel_size)
        blurred_face = cv2.GaussianBlur(face_region, kernel_size, 0)
        
        # Replace original face with blurred version
        frame[y1:y2, x1:x2] = blurred_face
        
        return frame
    
    def _apply_silhouette(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Replace face with solid color silhouette
        """
        x1, y1, x2, y2 = bbox
        
        # Fill face region with gray color
        cv2.rectangle(frame, (x1, y1), (x2, y2), (128, 128, 128), -1)
        
        return frame
    
    def anonymize_video(self, video_path: str, output_path: str) -> dict:
        """
        Anonymize all frames in a video file
        
        Args:
            video_path: Path to input video
            output_path: Path to save anonymized video
            
        Returns:
            Dictionary with processing statistics
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Initialize video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frames_processed = 0
        total_faces_detected = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Anonymize frame
            anonymized_frame, num_faces = self.anonymize_frame(frame)
            
            # Write anonymized frame
            out.write(anonymized_frame)
            
            frames_processed += 1
            total_faces_detected += num_faces
        
        # Release resources
        cap.release()
        out.release()
        
        return {
            "frames_processed": frames_processed,
            "total_frames": total_frames,
            "total_faces_detected": total_faces_detected,
            "average_faces_per_frame": total_faces_detected / frames_processed if frames_processed > 0 else 0,
            "output_path": output_path
        }
    
    def __del__(self):
        """Cleanup MediaPipe resources"""
        if hasattr(self, 'face_detection'):
            self.face_detection.close()
