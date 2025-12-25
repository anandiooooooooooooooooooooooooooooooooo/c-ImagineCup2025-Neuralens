# YOLO Model Placeholder

## Download YOLOv9 Weights

The NeuraLens CV engine uses YOLOv9 for student detection and tracking.

### Download Instructions:

1. Visit the Ultralytics YOLO repository:
   https://github.com/ultralytics/ultralytics

2. Download YOLOv9-C weights:
   ```bash
   wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov9c.pt
   ```

3. Place the downloaded file in this directory:
   ```
   src/cv-engine/models/yolov9-c.pt
   ```

### Alternative: Auto-download on First Run

The Ultralytics library will automatically download the model on first use if not found.

### Model Information:

- **Model**: YOLOv9-C (Compact)
- **Size**: ~25MB
- **Performance**: ~60 FPS on GPU, ~10 FPS on CPU
- **Accuracy**: mAP 50-95: 53.0%

### For Production:

Consider fine-tuning YOLO on classroom-specific data for better student detection accuracy.

---

**Note**: For MVP testing, you can skip YOLO and use single-student detection (already implemented in pose_estimator.py). YOLO is needed for multi-student tracking in production.
