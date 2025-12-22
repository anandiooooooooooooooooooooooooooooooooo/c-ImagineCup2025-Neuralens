# NeuraLens Webcam Testing Tool

Testing tool untuk menguji sistem deteksi ADHD/ASD menggunakan webcam laptop.

## 🎯 Fitur

- ✅ Akses webcam laptop secara real-time
- 🧠 Face detection menggunakan OpenCV
- 📊 Simulasi behavior analysis (Attention, Eye-Contact, dll)
- 📡 Kirim hasil deteksi ke backend API
- 📸 Screenshot capture
- 🎥 Real-time video preview

## 📋 Prerequisites

1. **Python 3.8+** terinstall
2. **Backend API** running di `http://localhost:5208`
3. **Webcam** yang berfungsi

## 🚀 Cara Menggunakan

### 1. Install Dependencies

```bash
cd testing
pip install -r requirements.txt
```

### 2. Start Backend

Pastikan backend sudah running:

```bash
cd ../backend/NeuraLens.Api
dotnet run
```

Backend akan berjalan di `http://localhost:5208`

### 3. Jalankan Webcam Test

```bash
cd ../testing
python webcam_test.py
```

## ⌨️ Keyboard Controls

Saat webcam test berjalan:

- **`q`** - Quit/keluar
- **`s`** - Save screenshot
- **`Space`** - Force detection (deteksi paksa)

## 📊 Informasi yang Ditampilkan

Window webcam akan menampilkan:
- ✅ Face detection dengan bounding box hijau
- 📝 Detection type dan confidence score
- 📈 FPS (frames per second)
- 👤 Jumlah wajah terdeteksi
- 📤 Total deteksi yang terkirim
- 🎞️ Frame count

## 🔧 Konfigurasi

Edit di `webcam_test.py`:

```python
BACKEND_URL = "http://localhost:5208/api"  # Backend API URL
DEVICE_ID = "webcam-test-001"              # Device identifier
CAMERA_INDEX = 0                            # 0 = default webcam
DETECTION_INTERVAL = 2                      # Deteksi setiap 2 detik
```

## 📡 Detection Types

Tool ini mensimulasikan deteksi untuk:
- **Attention-Focus** - Fokus perhatian anak
- **Eye-Contact** - Kontak mata
- **Facial-Expression** - Ekspresi wajah
- **Head-Movement** - Gerakan kepala

> **Note**: Ini adalah simulasi. Untuk production, ganti dengan model AI yang sudah dilatih untuk ADHD/ASD detection.

## 🐛 Troubleshooting

### Camera tidak bisa dibuka
- Pastikan tidak ada aplikasi lain yang menggunakan webcam
- Coba ubah `CAMERA_INDEX` ke 1 atau 2
- Check webcam permission di Windows Settings

### Backend connection error
- Pastikan backend sudah running di port 5208
- Check dengan browser: `http://localhost:5208/swagger`
- Pastikan firewall tidak memblokir

### Dependencies error
```bash
pip install --upgrade opencv-python numpy requests
```

## 📝 Output Data

Setiap deteksi akan dikirim ke backend dengan format:

```json
{
  "id": "det-1234567890-1",
  "deviceId": "webcam-test-001",
  "timestamp": "2025-12-22T14:45:00Z",
  "objectType": "Attention-Focus",
  "confidence": 87.5,
  "boundingBox": {
    "x": 150,
    "y": 100,
    "width": 200,
    "height": 250
  }
}
```

## 🎓 Next Steps

Untuk development lebih lanjut:
1. Integrate dengan model AI yang sudah dilatih (ONNX/TensorFlow)
2. Tambahkan pose estimation untuk activity recognition
3. Implement behavior tracking timeline
4. Add real-time analytics dashboard

## 📞 Support

Jika ada masalah, check:
- Backend logs di terminal backend
- Python error messages
- Webcam indicator light (should be ON)
