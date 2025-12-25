namespace NeuraLens.Api.Domain;

public class EdgeDevice
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DeviceType { get; set; } = string.Empty;
    public string Status { get; set; } = "offline"; // online, offline, error
    public DateTime LastSeen { get; set; }
    public string Location { get; set; } = string.Empty;
    public DeviceMetrics? Metrics { get; set; }
}

public class DeviceMetrics
{
    public double CpuUsage { get; set; }
    public double MemoryUsage { get; set; }
    public double Temperature { get; set; }
    public int FramesProcessed { get; set; }
    public double InferenceLatency { get; set; } // ms
    public double Accuracy { get; set; }
}

public class TelemetryData
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string DeviceId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string EventType { get; set; } = string.Empty;
    public Dictionary<string, object> Data { get; set; } = new();
}

public class DetectionResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string DeviceId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string ObjectType { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public BoundingBox? BoundingBox { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public Dictionary<string, object>? Metadata { get; set; }
}

public class BoundingBox
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}

public class Alert
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string DeviceId { get; set; } = string.Empty;
    public string Severity { get; set; } = "info"; // info, warning, critical
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
    public bool IsResolved { get; set; } = false;
}

public class DashboardStats
{
    public int TotalDevices { get; set; }
    public int OnlineDevices { get; set; }
    public int OfflineDevices { get; set; }
    public int TotalDetections { get; set; }
    public int ActiveAlerts { get; set; }
    public double AverageAccuracy { get; set; }
    public double AverageLatency { get; set; }
    public List<DetectionSummary> RecentDetections { get; set; } = new();
    public List<TimeSeriesData> DetectionsOverTime { get; set; } = new();
    public List<RiskScoreTrend> RiskScoreTimeline { get; set; } = new();
    public List<BehavioralIndicator> BehavioralIndicators { get; set; } = new();
    public List<HeatmapPoint> ClassroomHeatmap { get; set; } = new();
}

public class DetectionSummary
{
    public string ObjectType { get; set; } = string.Empty;
    public int Count { get; set; }
    public double AverageConfidence { get; set; }
}

public class TimeSeriesData
{
    public DateTime Timestamp { get; set; }
    public int Value { get; set; }
}

public class RiskScoreTrend
{
    public DateTime Timestamp { get; set; }
    public double AttentionScore { get; set; }
    public double HyperactivityScore { get; set; }
    public string StudentId { get; set; } = string.Empty;
}

public class BehavioralIndicator
{
    public string Behavior { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class HeatmapPoint
{
    public int X { get; set; }
    public int Y { get; set; }
    public double Activity { get; set; }
    public string Zone { get; set; } = string.Empty;
}
