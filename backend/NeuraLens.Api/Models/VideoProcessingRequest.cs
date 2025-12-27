namespace NeuraLens.Api.Models;

public class VideoProcessingRequest
{
    public string SessionId { get; set; } = string.Empty;
    public string VideoUrl { get; set; } = string.Empty; // Blob storage URL
    public string ClassroomId { get; set; } = string.Empty;
    public int ExpectedStudentCount { get; set; } = 20;
    public string AnonymizationMethod { get; set; } = "blur"; // "blur" or "silhouette"
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "pending"; // "pending", "processing", "completed", "failed"
}

public class VideoProcessingResponse
{
    public string SessionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<BehavioralFeatures> Students { get; set; } = new();
    public double ProcessingTime { get; set; }
    public int FramesProcessed { get; set; }
    public AnonymizationStats AnonymizationStats { get; set; } = new();
    public string ErrorMessage { get; set; } = string.Empty;
}

public class AnonymizationStats
{
    public int FramesProcessed { get; set; }
    public int TotalFacesDetected { get; set; }
    public double AverageFacesPerFrame { get; set; }
}