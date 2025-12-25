# Attention Duration Calculator

import numpy as np
from typing import List, Dict, Tuple
from collections import deque
from ..detection.pose_estimator import PoseLandmarks, PoseEstimator
from ..utils.config import settings

class AttentionCalculator:
    """
    Calculates Attention Duration Ratio (ADR) from head pose data.
    Tracks on-task vs off-task behavior based on head orientation.
    """
    
    def __init__(self):
        """Initialize attention calculator"""
        self.pose_estimator = PoseEstimator()
        self.attention_threshold = settings.ATTENTION_THRESHOLD
        self.on_task_yaw_threshold = settings.ON_TASK_YAW_THRESHOLD
        self.on_task_pitch_threshold = settings.ON_TASK_PITCH_THRESHOLD
        
        # Store attention history
        self.attention_history = deque(maxlen=100)
    
    def calculate_attention_duration(
        self,
        pose_sequence: List[PoseLandmarks],
        time_window: int = None
    ) -> Dict:
        """
        Calculate Attention Duration Ratio for a sequence of poses
        
        Args:
            pose_sequence: List of PoseLandmarks over time
            time_window: Time window in seconds (default: MEDIUM window)
            
        Returns:
            Dictionary with attention metrics
        """
        if not pose_sequence or len(pose_sequence) < 2:
            return self._empty_result()
        
        time_window = time_window or settings.TIME_WINDOW_MEDIUM
        
        # Analyze each pose for on-task behavior
        on_task_frames = 0
        off_task_frames = 0
        head_poses = []
        
        for pose in pose_sequence:
            if pose:
                is_on_task = self.pose_estimator.is_on_task(pose)
                head_pose = self.pose_estimator.get_head_pose(pose)
                
                if head_pose:
                    head_poses.append(head_pose)
                    if is_on_task:
                        on_task_frames += 1
                    else:
                        off_task_frames += 1
        
        total_frames = on_task_frames + off_task_frames
        
        if total_frames == 0:
            return self._empty_result()
        
        # Calculate attention ratio (percentage of time on-task)
        attention_ratio = on_task_frames / total_frames
        
        # Calculate focus durations
        focus_durations = self._calculate_focus_durations(pose_sequence)
        
        if focus_durations:
            longest_focus = max(focus_durations)
            average_focus = np.mean(focus_durations)
        else:
            longest_focus = 0.0
            average_focus = 0.0
        
        # Determine status
        if attention_ratio >= self.attention_threshold:
            status = "above_threshold"
        elif attention_ratio >= self.attention_threshold * 0.8:
            status = "normal"
        else:
            status = "below_threshold"
        
        # Calculate head movement variability (indicator of distraction)
        head_variability = self._calculate_head_variability(head_poses)
        
        return {
            "attention_ratio": round(attention_ratio, 3),
            "threshold": self.attention_threshold,
            "status": status,
            "longest_focus_duration": f"{int(longest_focus)}s",
            "average_focus_duration": f"{int(average_focus)}s",
            "time_window": f"{int(time_window)}s",
            "metrics": {
                "on_task_frames": on_task_frames,
                "off_task_frames": off_task_frames,
                "total_frames": total_frames,
                "focus_session_count": len(focus_durations),
                "head_movement_variability": round(head_variability, 3)
            }
        }
    
    def calculate_with_baseline(
        self,
        pose_sequence: List[PoseLandmarks],
        baseline_ratio: float,
        time_window: int = None
    ) -> Dict:
        """
        Calculate attention duration with baseline comparison
        
        Args:
            pose_sequence: List of PoseLandmarks
            baseline_ratio: Classroom baseline attention ratio
            time_window: Time window in seconds
            
        Returns:
            Dictionary with attention metrics including baseline deviation
        """
        result = self.calculate_attention_duration(pose_sequence, time_window)
        
        # Calculate deviation from baseline
        deviation = result["attention_ratio"] - baseline_ratio
        result["baseline_deviation"] = round(deviation, 3)
        
        # Update status based on baseline
        if deviation < -0.2:
            result["status"] = "significantly_below_baseline"
        elif deviation < -0.1:
            result["status"] = "below_baseline"
        elif deviation > 0.1:
            result["status"] = "above_baseline"
        else:
            result["status"] = "normal"
        
        return result
    
    def _calculate_focus_durations(self, pose_sequence: List[PoseLandmarks]) -> List[float]:
        """
        Calculate durations of continuous focus sessions
        
        Returns:
            List of focus durations in seconds
        """
        if not pose_sequence:
            return []
        
        focus_durations = []
        current_focus_start = None
        
        for i, pose in enumerate(pose_sequence):
            if pose:
                is_on_task = self.pose_estimator.is_on_task(pose)
                
                if is_on_task:
                    if current_focus_start is None:
                        current_focus_start = pose.timestamp
                else:
                    if current_focus_start is not None:
                        # End of focus session
                        duration = pose.timestamp - current_focus_start
                        if duration > 1.0:  # Only count sessions > 1 second
                            focus_durations.append(duration)
                        current_focus_start = None
        
        # Handle case where focus session extends to end of sequence
        if current_focus_start is not None and pose_sequence:
            duration = pose_sequence[-1].timestamp - current_focus_start
            if duration > 1.0:
                focus_durations.append(duration)
        
        return focus_durations
    
    def _calculate_head_variability(self, head_poses: List[Dict]) -> float:
        """
        Calculate variability in head orientation (indicator of distraction)
        
        Returns:
            Variability score (0-1 scale, higher = more variable/distracted)
        """
        if not head_poses or len(head_poses) < 2:
            return 0.0
        
        # Extract yaw and pitch values
        yaws = [hp["yaw"] for hp in head_poses]
        pitches = [hp["pitch"] for hp in head_poses]
        
        # Calculate standard deviation
        yaw_std = np.std(yaws)
        pitch_std = np.std(pitches)
        
        # Normalize to 0-1 scale (assuming max std of 30 degrees)
        variability = min(1.0, (yaw_std + pitch_std) / 60.0)
        
        return variability
    
    def detect_distraction_events(self, pose_sequence: List[PoseLandmarks]) -> Dict:
        """
        Detect specific distraction events (looking around, prolonged off-task)
        
        Returns:
            Dictionary with distraction analysis
        """
        if not pose_sequence or len(pose_sequence) < 5:
            return {"distraction_events": 0, "timestamps": []}
        
        distraction_events = []
        current_distraction_start = None
        
        for pose in pose_sequence:
            if pose:
                is_on_task = self.pose_estimator.is_on_task(pose)
                
                if not is_on_task:
                    if current_distraction_start is None:
                        current_distraction_start = pose.timestamp
                else:
                    if current_distraction_start is not None:
                        # End of distraction event
                        duration = pose.timestamp - current_distraction_start
                        if duration > 3.0:  # Only count distractions > 3 seconds
                            distraction_events.append({
                                "start_time": round(current_distraction_start, 2),
                                "duration": round(duration, 2),
                                "severity": "prolonged" if duration > 10 else "brief"
                            })
                        current_distraction_start = None
        
        # Handle case where distraction extends to end
        if current_distraction_start is not None and pose_sequence:
            duration = pose_sequence[-1].timestamp - current_distraction_start
            if duration > 3.0:
                distraction_events.append({
                    "start_time": round(current_distraction_start, 2),
                    "duration": round(duration, 2),
                    "severity": "prolonged" if duration > 10 else "brief"
                })
        
        return {
            "distraction_events": len(distraction_events),
            "timestamps": [de["start_time"] for de in distraction_events],
            "details": distraction_events,
            "total_distraction_time": sum(de["duration"] for de in distraction_events)
        }
    
    def analyze_attention_patterns(self, pose_sequence: List[PoseLandmarks]) -> Dict:
        """
        Comprehensive attention pattern analysis
        
        Returns:
            Dictionary with detailed attention patterns
        """
        if not pose_sequence:
            return {}
        
        # Get basic attention metrics
        attention_result = self.calculate_attention_duration(pose_sequence)
        
        # Get distraction events
        distraction_result = self.detect_distraction_events(pose_sequence)
        
        # Calculate attention consistency (how stable is attention over time)
        focus_durations = self._calculate_focus_durations(pose_sequence)
        if focus_durations:
            focus_consistency = 1.0 - (np.std(focus_durations) / (np.mean(focus_durations) + 0.001))
            focus_consistency = max(0.0, min(1.0, focus_consistency))
        else:
            focus_consistency = 0.0
        
        # Combine results
        return {
            **attention_result,
            "distraction_analysis": distraction_result,
            "focus_consistency": round(focus_consistency, 3),
            "pattern_classification": self._classify_attention_pattern(
                attention_result["attention_ratio"],
                len(distraction_result["details"]),
                focus_consistency
            )
        }
    
    def _classify_attention_pattern(
        self,
        attention_ratio: float,
        distraction_count: int,
        consistency: float
    ) -> str:
        """
        Classify attention pattern into categories
        
        Returns:
            Pattern classification string
        """
        if attention_ratio >= 0.8 and consistency >= 0.7:
            return "sustained_attention"
        elif attention_ratio >= 0.6 and distraction_count <= 3:
            return "moderate_attention_with_brief_distractions"
        elif distraction_count > 5:
            return "frequent_distractions"
        elif consistency < 0.4:
            return "inconsistent_attention"
        else:
            return "below_average_attention"
    
    def _empty_result(self) -> Dict:
        """Return empty result when no data available"""
        return {
            "attention_ratio": 0.0,
            "threshold": self.attention_threshold,
            "status": "no_data",
            "longest_focus_duration": "0s",
            "average_focus_duration": "0s",
            "time_window": "0s",
            "metrics": {
                "on_task_frames": 0,
                "off_task_frames": 0,
                "total_frames": 0,
                "focus_session_count": 0,
                "head_movement_variability": 0.0
            }
        }
