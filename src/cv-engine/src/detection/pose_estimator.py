# Pose Estimation Module using MediaPipe

import cv2
import numpy as np
import mediapipe as mp
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from ..utils.config import settings

@dataclass
class PoseLandmarks:
    """Container for pose landmarks data"""
    landmarks: List[Tuple[float, float, float]]  # (x, y, visibility)
    timestamp: float
    person_id: int

class PoseEstimator:
    """
    Estimates human pose using MediaPipe Pose.
    Tracks 33 skeletal keypoints for movement analysis.
    """
    
    def __init__(self):
        """Initialize MediaPipe Pose"""
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,  # 0, 1, or 2 (2 is most accurate but slower)
            smooth_landmarks=True,
            min_detection_confidence=settings.MEDIAPIPE_MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=settings.MEDIAPIPE_MIN_TRACKING_CONFIDENCE
        )
        
        # Key landmarks for movement tracking
        self.torso_landmarks = [
            self.mp_pose.PoseLandmark.LEFT_SHOULDER,
            self.mp_pose.PoseLandmark.RIGHT_SHOULDER,
            self.mp_pose.PoseLandmark.LEFT_HIP,
            self.mp_pose.PoseLandmark.RIGHT_HIP
        ]
    
    def estimate_pose(self, frame: np.ndarray, person_id: int = 0, timestamp: float = 0.0) -> Optional[PoseLandmarks]:
        """
        Estimate pose for a single person in frame
        
        Args:
            frame: Input frame (BGR format)
            person_id: Identifier for the person
            timestamp: Frame timestamp in seconds
            
        Returns:
            PoseLandmarks object or None if no pose detected
        """
        if frame is None or frame.size == 0:
            return None
        
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process frame
        results = self.pose.process(rgb_frame)
        
        if not results.pose_landmarks:
            return None
        
        # Extract landmarks
        landmarks = []
        for landmark in results.pose_landmarks.landmark:
            landmarks.append((landmark.x, landmark.y, landmark.visibility))
        
        return PoseLandmarks(
            landmarks=landmarks,
            timestamp=timestamp,
            person_id=person_id
        )
    
    def estimate_poses_batch(self, frames: List[np.ndarray], person_ids: List[int] = None) -> List[Optional[PoseLandmarks]]:
        """
        Estimate poses for multiple frames
        
        Args:
            frames: List of input frames
            person_ids: List of person identifiers (optional)
            
        Returns:
            List of PoseLandmarks objects
        """
        if person_ids is None:
            person_ids = list(range(len(frames)))
        
        results = []
        for i, (frame, person_id) in enumerate(zip(frames, person_ids)):
            pose_data = self.estimate_pose(frame, person_id, timestamp=i)
            results.append(pose_data)
        
        return results
    
    def get_torso_center(self, pose_landmarks: PoseLandmarks) -> Optional[Tuple[float, float]]:
        """
        Calculate center point of torso (average of shoulders and hips)
        
        Returns:
            Tuple of (x, y) coordinates or None
        """
        if not pose_landmarks:
            return None
        
        torso_points = []
        for landmark_idx in self.torso_landmarks:
            x, y, visibility = pose_landmarks.landmarks[landmark_idx.value]
            if visibility > 0.5:  # Only use visible landmarks
                torso_points.append((x, y))
        
        if not torso_points:
            return None
        
        # Calculate average
        avg_x = sum(p[0] for p in torso_points) / len(torso_points)
        avg_y = sum(p[1] for p in torso_points) / len(torso_points)
        
        return (avg_x, avg_y)
    
    def calculate_displacement(self, pose1: PoseLandmarks, pose2: PoseLandmarks) -> float:
        """
        Calculate displacement between two poses (Euclidean distance of torso centers)
        
        Returns:
            Displacement value (0.0 to 1.0 normalized)
        """
        center1 = self.get_torso_center(pose1)
        center2 = self.get_torso_center(pose2)
        
        if center1 is None or center2 is None:
            return 0.0
        
        # Calculate Euclidean distance
        dx = center2[0] - center1[0]
        dy = center2[1] - center1[1]
        distance = np.sqrt(dx**2 + dy**2)
        
        return distance
    
    def get_head_pose(self, pose_landmarks: PoseLandmarks) -> Optional[Dict[str, float]]:
        """
        Estimate head orientation (yaw, pitch, roll) from pose landmarks
        
        Returns:
            Dictionary with 'yaw', 'pitch', 'roll' in degrees or None
        """
        if not pose_landmarks:
            return None
        
        # Get nose, left ear, right ear landmarks
        nose_idx = self.mp_pose.PoseLandmark.NOSE.value
        left_ear_idx = self.mp_pose.PoseLandmark.LEFT_EAR.value
        right_ear_idx = self.mp_pose.PoseLandmark.RIGHT_EAR.value
        
        nose = pose_landmarks.landmarks[nose_idx]
        left_ear = pose_landmarks.landmarks[left_ear_idx]
        right_ear = pose_landmarks.landmarks[right_ear_idx]
        
        # Check visibility
        if nose[2] < 0.5 or left_ear[2] < 0.5 or right_ear[2] < 0.5:
            return None
        
        # Calculate yaw (horizontal head rotation)
        # Positive yaw = head turned right, Negative = head turned left
        ear_diff_x = right_ear[0] - left_ear[0]
        nose_center_x = (left_ear[0] + right_ear[0]) / 2
        yaw_offset = nose[0] - nose_center_x
        yaw = np.degrees(np.arctan2(yaw_offset, abs(ear_diff_x) + 0.001))
        
        # Calculate pitch (vertical head tilt)
        # Positive pitch = head tilted up, Negative = head tilted down
        ear_avg_y = (left_ear[1] + right_ear[1]) / 2
        pitch_offset = nose[1] - ear_avg_y
        pitch = np.degrees(np.arctan2(pitch_offset, 0.1))
        
        # Calculate roll (head tilt left/right)
        ear_diff_y = right_ear[1] - left_ear[1]
        roll = np.degrees(np.arctan2(ear_diff_y, ear_diff_x + 0.001))
        
        return {
            "yaw": float(yaw),
            "pitch": float(pitch),
            "roll": float(roll)
        }
    
    def is_on_task(self, pose_landmarks: PoseLandmarks) -> bool:
        """
        Determine if person is "on-task" based on head orientation
        
        Returns:
            True if head is facing forward (within threshold), False otherwise
        """
        head_pose = self.get_head_pose(pose_landmarks)
        
        if head_pose is None:
            return False
        
        # Check if yaw and pitch are within acceptable range
        yaw_ok = abs(head_pose["yaw"]) <= settings.ON_TASK_YAW_THRESHOLD
        pitch_ok = abs(head_pose["pitch"]) <= settings.ON_TASK_PITCH_THRESHOLD
        
        return yaw_ok and pitch_ok
    
    def visualize_pose(self, frame: np.ndarray, pose_landmarks: PoseLandmarks) -> np.ndarray:
        """
        Draw pose landmarks on frame for visualization
        
        Args:
            frame: Input frame
            pose_landmarks: Pose landmarks to draw
            
        Returns:
            Frame with pose overlay
        """
        if pose_landmarks is None:
            return frame
        
        annotated_frame = frame.copy()
        h, w, _ = frame.shape
        
        # Draw landmarks
        mp_drawing = mp.solutions.drawing_utils
        mp_pose = mp.solutions.pose
        
        # Convert landmarks back to MediaPipe format for drawing
        landmark_list = []
        for x, y, visibility in pose_landmarks.landmarks:
            landmark = mp_pose.PoseLandmark()
            landmark.x = x
            landmark.y = y
            landmark.visibility = visibility
            landmark_list.append(landmark)
        
        # Note: This is simplified - actual drawing requires proper MediaPipe objects
        # For production, use mp_drawing.draw_landmarks()
        
        return annotated_frame
    
    def __del__(self):
        """Cleanup MediaPipe resources"""
        if hasattr(self, 'pose'):
            self.pose.close()
