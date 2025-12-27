namespace NeuraLens.Api.Models;

public class BehavioralFeatures
{
    public string StudentId { get; set; } = string.Empty;
    public MovementIntensity MovementIntensity { get; set; } = new();
    public AttentionDuration AttentionDuration { get; set; } = new();
    public DateTime Timestamp { get; set; }
    public string SessionId { get; set; } = string.Empty;
}

public class MovementIntensity
{
    public double MovementIntensityScore { get; set; }
    public double Threshold { get; set; } = 0.70;
    public string Status { get; set; } = "normal"; // "elevated", "normal", "low"
    public int EventCount { get; set; }
    public string TimeWindow { get; set; } = "120s";
}

public class AttentionDuration
{
    public double AttentionRatio { get; set; }
    public double Threshold { get; set; } = 0.60;
    public string Status { get; set; } = "normal"; // "below_threshold", "normal", "above_threshold"
    public string LongestFocusDuration { get; set; } = "0s";
    public string AverageFocusDuration { get; set; } = "0s";
    public string TimeWindow { get; set; } = "120s";
}