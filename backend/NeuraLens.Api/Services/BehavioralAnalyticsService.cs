using NeuraLens.Api.Models;

namespace NeuraLens.Api.Services;

public interface IBehavioralAnalyticsService
{
    Task<ClassroomBaseline> CalculateClassroomBaselineAsync(string classroomId, string timeWindow = "120s");
    Task<List<StudentRiskCard>> GenerateStudentRiskCardsAsync(string sessionId);
    Task<List<BehavioralFeatures>> GetStudentBehavioralHistoryAsync(string studentId, DateTime startDate, DateTime endDate);
}

public class BehavioralAnalyticsService : IBehavioralAnalyticsService
{
    private readonly ICosmosDbService _cosmosDbService;
    private readonly ILogger<BehavioralAnalyticsService> _logger;

    public BehavioralAnalyticsService(ICosmosDbService cosmosDbService, ILogger<BehavioralAnalyticsService> logger)
    {
        _cosmosDbService = cosmosDbService;
        _logger = logger;
    }

    public async Task<ClassroomBaseline> CalculateClassroomBaselineAsync(string classroomId, string timeWindow = "120s")
    {
        try
        {
            _logger.LogInformation("Calculating classroom baseline for {ClassroomId}", classroomId);

            // Get all behavioral features for the classroom in the time window
            var features = await _cosmosDbService.GetBehavioralFeaturesByClassroomAsync(classroomId, timeWindow);

            if (!features.Any())
            {
                return new ClassroomBaseline
                {
                    ClassroomId = classroomId,
                    AverageMovementIntensity = 0.5, // Default baseline
                    AverageAttentionRatio = 0.6, // Default baseline
                    StudentCount = 0,
                    CalculatedAt = DateTime.UtcNow,
                    TimeWindow = timeWindow
                };
            }

            var baseline = new ClassroomBaseline
            {
                ClassroomId = classroomId,
                AverageMovementIntensity = features.Average(f => f.MovementIntensity.MovementIntensityScore),
                AverageAttentionRatio = features.Average(f => f.AttentionDuration.AttentionRatio),
                StudentCount = features.Select(f => f.StudentId).Distinct().Count(),
                CalculatedAt = DateTime.UtcNow,
                TimeWindow = timeWindow
            };

            _logger.LogInformation("Calculated baseline for {ClassroomId}: MII={MII}, ADR={ADR}, Students={Count}",
                classroomId, baseline.AverageMovementIntensity, baseline.AverageAttentionRatio, baseline.StudentCount);

            return baseline;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating classroom baseline for {ClassroomId}", classroomId);
            throw;
        }
    }

    public async Task<List<StudentRiskCard>> GenerateStudentRiskCardsAsync(string sessionId)
    {
        try
        {
            _logger.LogInformation("Generating student risk cards for session {SessionId}", sessionId);

            var features = await _cosmosDbService.GetBehavioralFeaturesBySessionAsync(sessionId);
            var baseline = await CalculateClassroomBaselineAsync(sessionId.Split('-')[0]); // Extract classroom from session

            var riskCards = new List<StudentRiskCard>();

            foreach (var studentFeatures in features.GroupBy(f => f.StudentId))
            {
                var latestFeature = studentFeatures.OrderByDescending(f => f.Timestamp).First();
                var riskAssessment = await CalculateRiskAssessmentAsync(latestFeature, baseline);

                var riskCard = new StudentRiskCard
                {
                    StudentId = studentFeatures.Key,
                    AnonymizedId = $"anonymous_{studentFeatures.Key.Split('_').Last()}",
                    CurrentRisk = riskAssessment,
                    RecentFeatures = studentFeatures.OrderByDescending(f => f.Timestamp).Take(10).ToList(),
                    ClassroomBaseline = baseline,
                    LastUpdated = DateTime.UtcNow
                };

                riskCards.Add(riskCard);
            }

            _logger.LogInformation("Generated {Count} risk cards for session {SessionId}", riskCards.Count, sessionId);
            return riskCards;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating student risk cards for session {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<List<BehavioralFeatures>> GetStudentBehavioralHistoryAsync(string studentId, DateTime startDate, DateTime endDate)
    {
        return await _cosmosDbService.GetBehavioralFeaturesByStudentAsync(studentId, startDate, endDate);
    }

    private async Task<RiskAssessment> CalculateRiskAssessmentAsync(BehavioralFeatures features, ClassroomBaseline baseline)
    {
        var riskFactors = new List<string>();
        var riskScore = 0.0;
        var riskLevel = "LOW";
        var riskCategory = "Normal";

        // Movement risk assessment
        var movementDeviation = features.MovementIntensity.MovementIntensityScore - baseline.AverageMovementIntensity;
        if (movementDeviation > 0.3)
        {
            riskFactors.Add("Elevated movement intensity compared to classroom average");
            riskScore += 30;
            riskCategory = "Movement";
        }

        // Attention risk assessment
        var attentionDeviation = baseline.AverageAttentionRatio - features.AttentionDuration.AttentionRatio;
        if (attentionDeviation > 0.2)
        {
            riskFactors.Add("Below average attention duration");
            riskScore += 40;
            if (riskCategory == "Movement") riskCategory = "Combined";
            else riskCategory = "Attention";
        }

        // Determine risk level
        if (riskScore >= 60) riskLevel = "HIGH";
        else if (riskScore >= 30) riskLevel = "MEDIUM";

        var recommendation = riskLevel switch
        {
            "HIGH" => "Immediate consultation with school psychologist recommended. Consider additional behavioral observations.",
            "MEDIUM" => "Monitor closely and consider interventions. Schedule follow-up assessment.",
            "LOW" => "Within normal range. Continue regular monitoring.",
            _ => "Continue monitoring."
        };

        return new RiskAssessment
        {
            StudentId = features.StudentId,
            RiskLevel = riskLevel,
            RiskScore = Math.Min(riskScore, 100),
            RiskCategory = riskCategory,
            RiskFactors = riskFactors,
            Recommendation = recommendation,
            AssessedAt = DateTime.UtcNow,
            SessionId = features.SessionId
        };
    }
}