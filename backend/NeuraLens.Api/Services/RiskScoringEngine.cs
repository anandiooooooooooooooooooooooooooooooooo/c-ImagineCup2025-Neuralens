using NeuraLens.Api.Models;

namespace NeuraLens.Api.Services;

public interface IRiskScoringEngine
{
    RiskAssessment AssessRisk(BehavioralFeatures features, ClassroomBaseline baseline);
    double CalculateRiskScore(MovementIntensity movement, AttentionDuration attention, ClassroomBaseline baseline);
}

public class RiskScoringEngine : IRiskScoringEngine
{
    private readonly ILogger<RiskScoringEngine> _logger;

    public RiskScoringEngine(ILogger<RiskScoringEngine> logger)
    {
        _logger = logger;
    }

    public RiskAssessment AssessRisk(BehavioralFeatures features, ClassroomBaseline baseline)
    {
        var riskScore = CalculateRiskScore(features.MovementIntensity, features.AttentionDuration, baseline);
        var riskLevel = DetermineRiskLevel(riskScore);
        var riskFactors = IdentifyRiskFactors(features, baseline);
        var recommendation = GenerateRecommendation(riskLevel, riskFactors);

        return new RiskAssessment
        {
            StudentId = features.StudentId,
            RiskLevel = riskLevel,
            RiskScore = riskScore,
            RiskCategory = DetermineRiskCategory(riskFactors),
            RiskFactors = riskFactors,
            Recommendation = recommendation,
            AssessedAt = DateTime.UtcNow,
            SessionId = features.SessionId
        };
    }

    public double CalculateRiskScore(MovementIntensity movement, AttentionDuration attention, ClassroomBaseline baseline)
    {
        double score = 0;

        // Movement component (0-50 points)
        var movementDeviation = movement.MovementIntensityScore - baseline.AverageMovementIntensity;
        if (movementDeviation > 0)
        {
            // Scale deviation to 0-50 points
            score += Math.Min(movementDeviation * 100, 50);
        }

        // Attention component (0-50 points)
        var attentionDeviation = baseline.AverageAttentionRatio - attention.AttentionRatio;
        if (attentionDeviation > 0)
        {
            // Scale deviation to 0-50 points
            score += Math.Min(attentionDeviation * 100, 50);
        }

        // Additional factors
        if (movement.EventCount > 20) score += 10; // High fidgeting
        if (attention.Status == "below_threshold") score += 15; // Low attention

        return Math.Min(score, 100);
    }

    private string DetermineRiskLevel(double score)
    {
        return score switch
        {
            >= 70 => "HIGH",
            >= 40 => "MEDIUM",
            _ => "LOW"
        };
    }

    private List<string> IdentifyRiskFactors(BehavioralFeatures features, ClassroomBaseline baseline)
    {
        var factors = new List<string>();

        // Movement factors
        var movementDev = features.MovementIntensity.MovementIntensityScore - baseline.AverageMovementIntensity;
        if (movementDev > 0.2)
            factors.Add($"Movement intensity {movementDev:F2} above classroom average");
        if (features.MovementIntensity.EventCount > 15)
            factors.Add($"High movement event count: {features.MovementIntensity.EventCount}");

        // Attention factors
        var attentionDev = baseline.AverageAttentionRatio - features.AttentionDuration.AttentionRatio;
        if (attentionDev > 0.15)
            factors.Add($"Attention ratio {attentionDev:F2} below classroom average");
        if (features.AttentionDuration.Status == "below_threshold")
            factors.Add("Attention duration below threshold");

        // Combined factors
        if (factors.Count >= 2)
            factors.Add("Multiple behavioral indicators suggest potential concern");

        return factors;
    }

    private string DetermineRiskCategory(List<string> riskFactors)
    {
        var hasMovement = riskFactors.Any(f => f.Contains("Movement"));
        var hasAttention = riskFactors.Any(f => f.Contains("Attention"));

        if (hasMovement && hasAttention) return "Combined";
        if (hasMovement) return "Movement";
        if (hasAttention) return "Attention";
        return "Normal";
    }

    private string GenerateRecommendation(string riskLevel, List<string> riskFactors)
    {
        return riskLevel switch
        {
            "HIGH" => "URGENT: Schedule immediate consultation with school psychologist. " +
                      "Consider additional behavioral assessments and parental involvement. " +
                      "Monitor closely for changes in behavior patterns.",

            "MEDIUM" => "MONITOR: Schedule follow-up assessment within 2 weeks. " +
                       "Implement classroom interventions and track progress. " +
                       "Consider teacher observations and additional data collection.",

            "LOW" => "MONITOR: Within normal behavioral range. " +
                    "Continue regular classroom observations. " +
                    "No immediate action required, but maintain ongoing monitoring.",

            _ => "Continue standard behavioral monitoring protocols."
        };
    }
}