using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Models;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BehavioralAnalyticsController : ControllerBase
{
    private readonly IBehavioralAnalyticsService _analyticsService;
    private readonly IRiskScoringEngine _riskEngine;
    private readonly IExplainableAIService _aiService;
    private readonly ILogger<BehavioralAnalyticsController> _logger;

    public BehavioralAnalyticsController(
        IBehavioralAnalyticsService analyticsService,
        IRiskScoringEngine riskEngine,
        IExplainableAIService aiService,
        ILogger<BehavioralAnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _riskEngine = riskEngine;
        _aiService = aiService;
        _logger = logger;
    }

    [HttpGet("baseline/{classroomId}")]
    public async Task<IActionResult> GetClassroomBaseline(string classroomId, [FromQuery] string timeWindow = "120s")
    {
        try
        {
            var baseline = await _analyticsService.CalculateClassroomBaselineAsync(classroomId, timeWindow);
            return Ok(baseline);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating classroom baseline for {ClassroomId}", classroomId);
            return StatusCode(500, "Error calculating baseline");
        }
    }

    [HttpGet("risk-cards/{sessionId}")]
    public async Task<IActionResult> GetStudentRiskCards(string sessionId)
    {
        try
        {
            var riskCards = await _analyticsService.GenerateStudentRiskCardsAsync(sessionId);

            // Enhance with AI explanations
            foreach (var card in riskCards)
            {
                try
                {
                    card.CurrentRisk.Recommendation = await _aiService.GenerateRecommendationsAsync(card);
                }
                catch (Exception aiEx)
                {
                    _logger.LogWarning(aiEx, "AI explanation failed for student {StudentId}, using fallback", card.StudentId);
                    // Keep the existing recommendation from RiskScoringEngine
                }
            }

            return Ok(riskCards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating risk cards for session {SessionId}", sessionId);
            return StatusCode(500, "Error generating risk cards");
        }
    }

    [HttpGet("student/{studentId}/history")]
    public async Task<IActionResult> GetStudentHistory(
        string studentId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            var history = await _analyticsService.GetStudentBehavioralHistoryAsync(studentId, startDate, endDate);
            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving history for student {StudentId}", studentId);
            return StatusCode(500, "Error retrieving student history");
        }
    }

    [HttpPost("assess-risk")]
    public async Task<IActionResult> AssessRisk([FromBody] BehavioralFeatures features)
    {
        try
        {
            // Calculate classroom baseline for comparison
            var classroomId = features.SessionId.Split('-').First(); // Extract classroom from session
            var baseline = await _analyticsService.CalculateClassroomBaselineAsync(classroomId);

            // Assess risk
            var riskAssessment = _riskEngine.AssessRisk(features, baseline);

            // Generate AI explanation
            string explanation = "AI explanation not available";
            try
            {
                explanation = await _aiService.GenerateBehavioralExplanationAsync(riskAssessment, baseline);
            }
            catch (Exception aiEx)
            {
                _logger.LogWarning(aiEx, "AI explanation failed, using fallback");
            }

            return Ok(new
            {
                riskAssessment,
                explanation,
                baseline,
                assessedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assessing risk");
            return StatusCode(500, "Error assessing risk");
        }
    }

    [HttpPost("ask-ai")]
    public async Task<IActionResult> AskAI([FromBody] AIQuestionRequest request)
    {
        try
        {
            var context = await _analyticsService.GetStudentBehavioralHistoryAsync(
                request.StudentId,
                DateTime.UtcNow.AddDays(-30),
                DateTime.UtcNow);

            var answer = await _aiService.AnswerBehavioralQuestionAsync(request.Question, context);

            return Ok(new
            {
                question = request.Question,
                answer,
                contextUsed = context.Count,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing AI question");
            return StatusCode(500, "Error processing question");
        }
    }

    [HttpGet("analytics/summary")]
    public async Task<IActionResult> GetAnalyticsSummary([FromQuery] string classroomId, [FromQuery] DateTime? date = null)
    {
        try
        {
            var targetDate = date ?? DateTime.UtcNow.Date;
            var startDate = targetDate;
            var endDate = targetDate.AddDays(1);

            // Get all sessions for the classroom on the target date
            // This is simplified - in reality you'd query for sessions by classroom and date
            var sessions = new[] { $"{classroomId}-{targetDate:yyyyMMdd}" };

            var summary = new AnalyticsSummary
            {
                ClassroomId = classroomId,
                Date = targetDate,
                TotalSessions = sessions.Length,
                RiskDistribution = new Dictionary<string, int>(),
                AverageRiskScore = 0,
                StudentsMonitored = 0
            };

            var allRiskCards = new List<StudentRiskCard>();
            foreach (var sessionId in sessions)
            {
                try
                {
                    var riskCards = await _analyticsService.GenerateStudentRiskCardsAsync(sessionId);
                    allRiskCards.AddRange(riskCards);
                }
                catch
                {
                    // Skip sessions that don't exist
                }
            }

            if (allRiskCards.Any())
            {
                summary.StudentsMonitored = allRiskCards.Select(c => c.StudentId).Distinct().Count();
                summary.AverageRiskScore = allRiskCards.Average(c => c.CurrentRisk.RiskScore);

                summary.RiskDistribution = allRiskCards
                    .GroupBy(c => c.CurrentRisk.RiskLevel)
                    .ToDictionary(g => g.Key, g => g.Count());
            }

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating analytics summary");
            return StatusCode(500, "Error generating summary");
        }
    }
}

public class AIQuestionRequest
{
    public string StudentId { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
}

public class AnalyticsSummary
{
    public string ClassroomId { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int TotalSessions { get; set; }
    public Dictionary<string, int> RiskDistribution { get; set; } = new();
    public double AverageRiskScore { get; set; }
    public int StudentsMonitored { get; set; }
}