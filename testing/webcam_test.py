"""
NeuraLens Webcam Testing Tool
Test ADHD/ASD detection using local webcam
Sends detection results to backend API
"""

import cv2
import time
import requests
import json
from datetime import datetime
import numpy as np

# Configuration
BACKEND_URL = "http://localhost:5208/api"
DEVICE_ID = "webcam-test-001"
CAMERA_INDEX = 0  # 0 for default webcam, change if you have multiple cameras

# Detection parameters
CONFIDENCE_THRESHOLD = 0.7
DETECTION_INTERVAL = 2  # seconds between detections

class WebcamTester:
    def __init__(self):
        self.cap = None
        self.running = False
        self.detection_count = 0
        
        # Initialize face detector (using Haar Cascade - lightweight)
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
    def initialize_camera(self):
        """Initialize webcam"""
        print(f"🎥 Initializing camera {CAMERA_INDEX}...")
        self.cap = cv2.VideoCapture(CAMERA_INDEX)
        
        if not self.cap.isOpened():
            print("❌ Error: Could not open webcam!")
            return False
            
        # Set camera properties
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print("✅ Camera initialized successfully!")
        return True
    
    def detect_faces(self, frame):
        """Detect faces in frame"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        return faces
    
    def analyze_behavior(self, frame, faces):
        """
        Simulate behavior analysis for ADHD/ASD indicators
        In production, this would use trained AI model
        """
        detections = []
        
        for (x, y, w, h) in faces:
            # Draw rectangle around face
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Simulate detection types
            detection_types = [
                "Attention-Focus",
                "Eye-Contact",
                "Facial-Expression",
                "Head-Movement"
            ]
            
            # Random confidence for demo (in production, use real model)
            detection_type = detection_types[self.detection_count % len(detection_types)]
            confidence = 0.75 + (np.random.random() * 0.2)  # 75-95%
            
            detection = {
                "id": f"det-{int(time.time())}-{self.detection_count}",
                "deviceId": DEVICE_ID,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "objectType": detection_type,
                "confidence": round(confidence * 100, 2),
                "boundingBox": {
                    "x": int(x),
                    "y": int(y),
                    "width": int(w),
                    "height": int(h)
                }
            }
            
            detections.append(detection)
            
            # Draw detection info
            label = f"{detection_type}: {confidence*100:.1f}%"
            cv2.putText(frame, label, (x, y-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        return detections
    
    def send_to_backend(self, detection):
        """Send detection to backend API"""
        try:
            response = requests.post(
                f"{BACKEND_URL}/detections",
                json=detection,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Detection sent: {detection['objectType']} ({detection['confidence']:.1f}%)")
                return True
            else:
                print(f"⚠️  API returned: {response.status_code}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend. Make sure backend is running!")
            return False
        except Exception as e:
            print(f"❌ Error sending detection: {e}")
            return False
    
    def run(self):
        """Main testing loop"""
        if not self.initialize_camera():
            return
        
        print("\n" + "="*60)
        print("🧠 NeuraLens Webcam Testing Tool")
        print("="*60)
        print(f"📡 Backend: {BACKEND_URL}")
        print(f"🎥 Device ID: {DEVICE_ID}")
        print(f"⏱️  Detection interval: {DETECTION_INTERVAL}s")
        print("\n📋 Instructions:")
        print("  - Press 'q' to quit")
        print("  - Press 's' to save screenshot")
        print("  - Press 'space' to force detection")
        print("="*60 + "\n")
        
        self.running = True
        last_detection_time = 0
        frame_count = 0
        
        try:
            while self.running:
                ret, frame = self.cap.read()
                if not ret:
                    print("❌ Error reading frame!")
                    break
                
                frame_count += 1
                current_time = time.time()
                
                # Detect faces
                faces = self.detect_faces(frame)
                
                # Periodic detection
                if current_time - last_detection_time >= DETECTION_INTERVAL:
                    if len(faces) > 0:
                        detections = self.analyze_behavior(frame, faces)
                        
                        # Send to backend
                        for detection in detections:
                            self.send_to_backend(detection)
                            self.detection_count += 1
                        
                        last_detection_time = current_time
                    else:
                        # Draw "no face detected" message
                        cv2.putText(frame, "No face detected", (10, 30),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                # Draw info overlay
                info_text = [
                    f"FPS: {int(1.0 / (time.time() - current_time + 0.001))}",
                    f"Faces: {len(faces)}",
                    f"Detections sent: {self.detection_count}",
                    f"Frame: {frame_count}"
                ]
                
                y_pos = frame.shape[0] - 80
                for text in info_text:
                    cv2.putText(frame, text, (10, y_pos),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                    y_pos += 20
                
                # Display frame
                cv2.imshow('NeuraLens Webcam Test', frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    print("\n👋 Quitting...")
                    break
                elif key == ord('s'):
                    filename = f"screenshot_{int(time.time())}.jpg"
                    cv2.imwrite(filename, frame)
                    print(f"📸 Screenshot saved: {filename}")
                elif key == ord(' '):
                    print("🔍 Forcing detection...")
                    if len(faces) > 0:
                        detections = self.analyze_behavior(frame, faces)
                        for detection in detections:
                            self.send_to_backend(detection)
                            self.detection_count += 1
                
        except KeyboardInterrupt:
            print("\n\n⚠️  Interrupted by user")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Release resources"""
        print("\n🧹 Cleaning up...")
        if self.cap:
            self.cap.release()
        cv2.destroyAllWindows()
        print("✅ Done! Total detections sent: {}".format(self.detection_count))

def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/devices", timeout=2)
        return response.status_code == 200
    except:
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Starting NeuraLens Webcam Testing Tool")
    print("="*60)
    
    # Check backend
    print("\n🔍 Checking backend connection...")
    if check_backend():
        print("✅ Backend is running!")
    else:
        print("⚠️  Warning: Backend is not responding!")
        print(f"   Make sure backend is running at {BACKEND_URL}")
        response = input("\n   Continue anyway? (y/n): ")
        if response.lower() != 'y':
            print("👋 Exiting...")
            exit()
    
    # Start testing
    tester = WebcamTester()
    tester.run()
