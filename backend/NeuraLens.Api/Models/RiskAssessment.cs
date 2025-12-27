namespace NeuraLens.Api.Models;

public class RiskAssessment
{
    public string StudentId { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = "LOW"; // "LOW", "MEDIUM", "HIGH"
    public double RiskScore { get; set; } // 0-100
    public string RiskCategory { get; set; } = string.Empty; // "Movement", "Attention", "Combined"
    public List<string> RiskFactors { get; set; } = new();
    public string Recommendation { get; set; } = string.Empty;
    public DateTime AssessedAt { get; set; }
    public string SessionId { get; set; } = string.Empty;
}

public class ClassroomBaseline
{
    public string ClassroomId { get; set; } = string.Empty;
    public double AverageMovementIntensity { get; set; }
    public double AverageAttentionRatio { get; set; }
    public int StudentCount { get; set; }
    public DateTime CalculatedAt { get; set; }
    public string TimeWindow { get; set; } = "120s";
}

public class StudentRiskCard
{
    public string StudentId { get; set; } = string.Empty;
    public string AnonymizedId { get; set; } = string.Empty;
    public RiskAssessment CurrentRisk { get; set; } = new();
    public List<BehavioralFeatures> RecentFeatures { get; set; } = new();
    public ClassroomBaseline ClassroomBaseline { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}