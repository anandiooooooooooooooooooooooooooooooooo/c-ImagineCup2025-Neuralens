using Azure.AI.Projects;
using NeuraLens.Api.Models;

namespace NeuraLens.Api.Services;

public interface IExplainableAIService
{
    Task<string> GenerateBehavioralExplanationAsync(RiskAssessment riskAssessment, ClassroomBaseline baseline);
    Task<string> GenerateRecommendationsAsync(StudentRiskCard riskCard);
    Task<string> AnswerBehavioralQuestionAsync(string question, List<BehavioralFeatures> context);
}

public class ExplainableAIService : IExplainableAIService
{
    private readonly ILogger<ExplainableAIService> _logger;
    private readonly IConfiguration _configuration;
    private readonly bool _isConfigured;

    public ExplainableAIService(ILogger<ExplainableAIService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;

        var connectionString = _configuration["Azure:AI:ConnectionString"];
        if (!string.IsNullOrEmpty(connectionString) && connectionString != "YOUR_AZURE_AI_CONNECTION_STRING")
        {
            _isConfigured = true;
            _logger.LogInformation("Azure AI Agent service initialized successfully");
        }
        else
        {
            _logger.LogInformation("Azure AI Agent service not configured");
            _isConfigured = false;
        }
    }

    public async Task<string> GenerateBehavioralExplanationAsync(RiskAssessment riskAssessment, ClassroomBaseline baseline)
    {
        // For now, use fallback explanation until Azure AI Projects API is properly configured
        return GenerateFallbackExplanation(riskAssessment, baseline);
    }

    public async Task<string> GenerateRecommendationsAsync(StudentRiskCard riskCard)
    {
        // For now, use fallback recommendations until Azure AI Projects API is properly configured
        return GenerateFallbackRecommendations(riskCard);
    }

    public async Task<string> AnswerBehavioralQuestionAsync(string question, List<BehavioralFeatures> context)
    {
        // For now, return a simple response until Azure AI Projects API is properly configured
        return "I'm sorry, but the AI explanation service is not currently available. Please consult with a behavioral specialist for detailed analysis.";
    }

    private string BuildBehavioralExplanationPrompt(RiskAssessment riskAssessment, ClassroomBaseline baseline)
    {
        return $@"
Based on classroom behavioral observations, please explain the following assessment results:

Risk Assessment:
- Risk Level: {riskAssessment.RiskLevel}
- Risk Score: {riskAssessment.RiskScore:F1}/100
- Risk Category: {riskAssessment.RiskCategory}
- Risk Factors: {string.Join(", ", riskAssessment.RiskFactors)}

Classroom Baseline:
- Average Movement Intensity: {baseline.AverageMovementIntensity:F2}
- Average Attention Ratio: {baseline.AverageAttentionRatio:F2}
- Student Count: {baseline.StudentCount}

Please provide a clear, professional explanation of what these metrics indicate about the student's classroom behavior. Include:
1. What the behavioral patterns suggest
2. Why this assessment was made
3. Important caveats about interpretation
4. Recommendation for next steps

Remember: This is not a medical diagnosis. Always recommend professional consultation.
";
    }

    private string BuildRecommendationsPrompt(StudentRiskCard riskCard)
    {
        return $@"
Based on the following behavioral assessment, please provide practical recommendations for teachers and parents:

Student Risk Assessment:
- Risk Level: {riskCard.CurrentRisk.RiskLevel}
- Risk Category: {riskCard.CurrentRisk.RiskCategory}
- Risk Factors: {string.Join(", ", riskCard.CurrentRisk.RiskFactors)}

Classroom Context:
- Classroom Average Movement: {riskCard.ClassroomBaseline.AverageMovementIntensity:F2}
- Classroom Average Attention: {riskCard.ClassroomBaseline.AverageAttentionRatio:F2}

Please provide:
1. Immediate classroom strategies for teachers
2. Home-based support recommendations for parents
3. Monitoring suggestions
4. When to seek professional consultation
5. Positive reinforcement approaches

Focus on practical, evidence-based interventions that support the student's success.
";
    }

    private string BuildQuestionPrompt(string question, List<BehavioralFeatures> context)
    {
        var contextSummary = context.Any() ?
            $"Behavioral data from {context.Count} observations shows average movement intensity of {context.Average(f => f.MovementIntensity.MovementIntensityScore):F2} and average attention ratio of {context.Average(f => f.AttentionDuration.AttentionRatio):F2}." :
            "No behavioral data available.";

        return $@"
Question: {question}

Context: {contextSummary}

Please answer this question based on the behavioral observation data provided. Be professional, accurate, and remember that this system provides behavioral insights, not medical diagnoses.
";
    }

    private string GenerateFallbackExplanation(RiskAssessment riskAssessment, ClassroomBaseline baseline)
    {
        return $@"
Behavioral Assessment Summary:

This student shows {riskAssessment.RiskLevel.ToLower()} risk indicators based on classroom behavioral observations.

Key Findings:
- Risk Score: {riskAssessment.RiskScore:F1}/100
- Primary Concerns: {string.Join(", ", riskAssessment.RiskFactors)}

Interpretation:
{riskAssessment.Recommendation}

Important Notes:
- These observations are based on automated analysis of movement and attention patterns
- Individual results should be considered alongside other behavioral indicators
- This is not a substitute for professional behavioral assessment
- Consult with school psychologists or behavioral specialists for comprehensive evaluation

For more detailed analysis, please consult with qualified professionals who can interpret these patterns in the full context of the student's development and classroom environment.
";
    }

    private string GenerateFallbackRecommendations(StudentRiskCard riskCard)
    {
        return $@"
Recommendations for {riskCard.CurrentRisk.RiskLevel} Risk Level:

Immediate Actions:
- Continue monitoring behavioral patterns
- Document observations systematically
- Maintain consistent classroom routines

Support Strategies:
- Provide clear behavioral expectations
- Use positive reinforcement for desired behaviors
- Consider environmental modifications if needed

Professional Consultation:
{riskCard.CurrentRisk.Recommendation}

Remember: Early intervention is key. Work with school support staff to develop an appropriate action plan based on comprehensive assessment.
";
    }
}