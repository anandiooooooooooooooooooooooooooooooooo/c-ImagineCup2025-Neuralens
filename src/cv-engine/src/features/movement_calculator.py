# Movement Intensity Calculator

import numpy as np
from typing import List, Dict
from collections import deque
from ..detection.pose_estimator import PoseLandmarks, PoseEstimator
from ..utils.config import settings

class MovementCalculator:
    """
    Calculates Movement Intensity Index (MII) from pose data.
    Tracks fidgeting, position changes, and excessive movement.
    """
    
    def __init__(self):
        """Initialize movement calculator"""
        self.pose_estimator = PoseEstimator()
        self.movement_threshold = settings.MOVEMENT_THRESHOLD
        
        # Store recent movements for temporal analysis
        self.movement_history = deque(maxlen=100)
    
    def calculate_movement_intensity(
        self,
        pose_sequence: List[PoseLandmarks],
        time_window: int = None
    ) -> Dict:
        """
        Calculate Movement Intensity Index for a sequence of poses
        
        Args:
            pose_sequence: List of PoseLandmarks over time
            time_window: Time window in seconds (default: MEDIUM window)
            
        Returns:
            Dictionary with movement intensity metrics
        """
        if not pose_sequence or len(pose_sequence) < 2:
            return self._empty_result()
        
        time_window = time_window or settings.TIME_WINDOW_MEDIUM
        
        # Calculate frame-to-frame displacements
        displacements = []
        for i in range(len(pose_sequence) - 1):
            if pose_sequence[i] and pose_sequence[i + 1]:
                displacement = self.pose_estimator.calculate_displacement(
                    pose_sequence[i],
                    pose_sequence[i + 1]
                )
                displacements.append(displacement)
        
        if not displacements:
            return self._empty_result()
        
        # Calculate movement metrics
        avg_displacement = np.mean(displacements)
        max_displacement = np.max(displacements)
        std_displacement = np.std(displacements)
        
        # Count significant movement events
        # A "significant movement" is displacement > 2 * average
        movement_threshold_local = avg_displacement * 2
        significant_movements = sum(1 for d in displacements if d > movement_threshold_local)
        
        # Calculate movement velocity (displacement per second)
        total_time = pose_sequence[-1].timestamp - pose_sequence[0].timestamp
        if total_time > 0:
            movement_velocity = sum(displacements) / total_time
        else:
            movement_velocity = 0.0
        
        # Normalize movement intensity score (0-1 scale)
        # Higher values = more movement
        movement_score = min(1.0, avg_displacement * 10)  # Scale factor of 10
        
        # Determine status
        if movement_score > self.movement_threshold:
            status = "elevated"
        elif movement_score > self.movement_threshold * 0.8:
            status = "normal"
        else:
            status = "low"
        
        return {
            "movement_intensity_score": round(movement_score, 3),
            "threshold": self.movement_threshold,
            "status": status,
            "event_count": significant_movements,
            "time_window": f"{int(time_window)}s",
            "metrics": {
                "average_displacement": round(avg_displacement, 4),
                "max_displacement": round(max_displacement, 4),
                "std_displacement": round(std_displacement, 4),
                "movement_velocity": round(movement_velocity, 4),
                "total_frames": len(pose_sequence)
            }
        }
    
    def calculate_with_baseline(
        self,
        pose_sequence: List[PoseLandmarks],
        baseline_score: float,
        time_window: int = None
    ) -> Dict:
        """
        Calculate movement intensity with baseline comparison
        
        Args:
            pose_sequence: List of PoseLandmarks
            baseline_score: Classroom baseline movement score
            time_window: Time window in seconds
            
        Returns:
            Dictionary with movement metrics including baseline deviation
        """
        result = self.calculate_movement_intensity(pose_sequence, time_window)
        
        # Calculate deviation from baseline
        deviation = result["movement_intensity_score"] - baseline_score
        result["baseline_deviation"] = round(deviation, 3)
        
        # Update status based on baseline
        if deviation > 0.2:
            result["status"] = "elevated"
        elif deviation > 0.1:
            result["status"] = "above_baseline"
        elif deviation < -0.1:
            result["status"] = "below_baseline"
        else:
            result["status"] = "normal"
        
        return result
    
    def detect_fidgeting_patterns(self, pose_sequence: List[PoseLandmarks]) -> Dict:
        """
        Detect specific fidgeting patterns (repetitive small movements)
        
        Returns:
            Dictionary with fidgeting analysis
        """
        if not pose_sequence or len(pose_sequence) < 10:
            return {"fidgeting_detected": False, "pattern_count": 0}
        
        # Calculate displacements
        displacements = []
        for i in range(len(pose_sequence) - 1):
            if pose_sequence[i] and pose_sequence[i + 1]:
                displacement = self.pose_estimator.calculate_displacement(
                    pose_sequence[i],
                    pose_sequence[i + 1]
                )
                displacements.append(displacement)
        
        if not displacements:
            return {"fidgeting_detected": False, "pattern_count": 0}
        
        # Fidgeting = frequent small movements (high frequency, low amplitude)
        avg_displacement = np.mean(displacements)
        small_movements = [d for d in displacements if 0 < d < avg_displacement * 0.5]
        
        # Count clusters of small movements
        fidget_threshold = len(displacements) * 0.3  # 30% of frames
        fidgeting_detected = len(small_movements) > fidget_threshold
        
        # Calculate fidgeting frequency
        if fidgeting_detected:
            total_time = pose_sequence[-1].timestamp - pose_sequence[0].timestamp
            fidget_frequency = len(small_movements) / total_time if total_time > 0 else 0
        else:
            fidget_frequency = 0
        
        return {
            "fidgeting_detected": fidgeting_detected,
            "pattern_count": len(small_movements),
            "fidget_frequency": round(fidget_frequency, 2),  # movements per second
            "percentage_of_time": round(len(small_movements) / len(displacements) * 100, 1)
        }
    
    def detect_position_changes(self, pose_sequence: List[PoseLandmarks]) -> Dict:
        """
        Detect major position changes (standing up, changing seats, etc.)
        
        Returns:
            Dictionary with position change analysis
        """
        if not pose_sequence or len(pose_sequence) < 5:
            return {"position_changes": 0, "timestamps": []}
        
        # Calculate displacements
        displacements = []
        timestamps = []
        for i in range(len(pose_sequence) - 1):
            if pose_sequence[i] and pose_sequence[i + 1]:
                displacement = self.pose_estimator.calculate_displacement(
                    pose_sequence[i],
                    pose_sequence[i + 1]
                )
                displacements.append(displacement)
                timestamps.append(pose_sequence[i + 1].timestamp)
        
        if not displacements:
            return {"position_changes": 0, "timestamps": []}
        
        # Major position change = displacement > 3 * average
        avg_displacement = np.mean(displacements)
        position_change_threshold = avg_displacement * 3
        
        position_changes = []
        for i, (disp, ts) in enumerate(zip(displacements, timestamps)):
            if disp > position_change_threshold:
                position_changes.append({
                    "timestamp": round(ts, 2),
                    "displacement": round(disp, 4),
                    "frame_index": i
                })
        
        return {
            "position_changes": len(position_changes),
            "timestamps": [pc["timestamp"] for pc in position_changes],
            "details": position_changes
        }
    
    def _empty_result(self) -> Dict:
        """Return empty result when no data available"""
        return {
            "movement_intensity_score": 0.0,
            "threshold": self.movement_threshold,
            "status": "no_data",
            "event_count": 0,
            "time_window": "0s",
            "metrics": {
                "average_displacement": 0.0,
                "max_displacement": 0.0,
                "std_displacement": 0.0,
                "movement_velocity": 0.0,
                "total_frames": 0
            }
        }
