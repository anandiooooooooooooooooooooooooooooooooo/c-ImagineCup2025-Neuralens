using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Models;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IBehavioralAnalyticsService _analyticsService;
    private readonly ICosmosDbService _cosmosService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IBehavioralAnalyticsService analyticsService,
        ICosmosDbService cosmosService,
        ILogger<DashboardController> logger)
    {
        _analyticsService = analyticsService;
        _cosmosService = cosmosService;
        _logger = logger;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetDashboardOverview([FromQuery] string classroomId = "default")
    {
        try
        {
            // Get current classroom baseline
            var baseline = await _analyticsService.CalculateClassroomBaselineAsync(classroomId);

            // Get recent risk cards (last session)
            var recentSessionId = $"{classroomId}-{DateTime.UtcNow:yyyyMMdd}";
            List<StudentRiskCard> recentRiskCards = new();
            try
            {
                recentRiskCards = await _analyticsService.GenerateStudentRiskCardsAsync(recentSessionId);
            }
            catch
            {
                // No recent session, return empty
            }

            // Calculate summary statistics
            var overview = new DashboardOverview
            {
                ClassroomId = classroomId,
                Baseline = baseline,
                RecentSession = new SessionSummary
                {
                    SessionId = recentSessionId,
                    StudentCount = recentRiskCards.Count,
                    HighRiskCount = recentRiskCards.Count(c => c.CurrentRisk.RiskLevel == "HIGH"),
                    MediumRiskCount = recentRiskCards.Count(c => c.CurrentRisk.RiskLevel == "MEDIUM"),
                    LowRiskCount = recentRiskCards.Count(c => c.CurrentRisk.RiskLevel == "LOW"),
                    AverageRiskScore = recentRiskCards.Any() ? recentRiskCards.Average(c => c.CurrentRisk.RiskScore) : 0,
                    Timestamp = DateTime.UtcNow
                },
                TopRiskFactors = GetTopRiskFactors(recentRiskCards),
                LastUpdated = DateTime.UtcNow
            };

            return Ok(overview);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating dashboard overview");
            return StatusCode(500, "Error generating overview");
        }
    }

    [HttpGet("timeline/{studentId}")]
    public async Task<IActionResult> GetStudentTimeline(
        string studentId,
        [FromQuery] int days = 7)
    {
        try
        {
            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-days);

            var history = await _analyticsService.GetStudentBehavioralHistoryAsync(studentId, startDate, endDate);

            var timeline = history
                .OrderBy(h => h.Timestamp)
                .Select(h => new TimelinePoint
                {
                    Timestamp = h.Timestamp,
                    MovementIntensity = h.MovementIntensity.MovementIntensityScore,
                    AttentionRatio = h.AttentionDuration.AttentionRatio,
                    RiskLevel = CalculateRiskLevel(h.MovementIntensity.MovementIntensityScore, h.AttentionDuration.AttentionRatio),
                    SessionId = h.SessionId
                })
                .ToList();

            return Ok(new
            {
                studentId,
                timeline,
                period = new { startDate, endDate, days }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating student timeline for {StudentId}", studentId);
            return StatusCode(500, "Error generating timeline");
        }
    }

    [HttpGet("heatmap/{classroomId}")]
    public async Task<IActionResult> GetClassroomHeatmap(string classroomId, [FromQuery] DateTime? date = null)
    {
        try
        {
            var targetDate = date ?? DateTime.UtcNow.Date;
            var sessionId = $"{classroomId}-{targetDate:yyyyMMdd}";

            var riskCards = await _analyticsService.GenerateStudentRiskCardsAsync(sessionId);

            var heatmap = new ClassroomHeatmap
            {
                ClassroomId = classroomId,
                Date = targetDate,
                SessionId = sessionId,
                StudentPositions = riskCards.Select((card, index) => new StudentPosition
                {
                    StudentId = card.AnonymizedId,
                    X = (index % 5) * 20 + 10, // Simple grid layout
                    Y = (index / 5) * 20 + 10,
                    RiskLevel = card.CurrentRisk.RiskLevel,
                    RiskScore = card.CurrentRisk.RiskScore
                }).ToList()
            };

            return Ok(heatmap);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating classroom heatmap for {ClassroomId}", classroomId);
            return StatusCode(500, "Error generating heatmap");
        }
    }

    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts([FromQuery] int limit = 10)
    {
        try
        {
            // Get alerts from Cosmos DB (using existing method)
            var alerts = await _cosmosService.GetAlertsAsync(unreadOnly: true, limit: limit);

            // Convert to dashboard alerts
            var dashboardAlerts = alerts.Select(a => new DashboardAlert
            {
                Id = a.Id,
                Type = "behavioral",
                Severity = a.Severity,
                Message = a.Message,
                StudentId = a.DeviceId, // Assuming DeviceId maps to StudentId
                Timestamp = a.Timestamp,
                IsRead = a.IsRead
            }).ToList();

            return Ok(dashboardAlerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving alerts");
            return StatusCode(500, "Error retrieving alerts");
        }
    }

    [HttpGet("reports/daily")]
    public async Task<IActionResult> GetDailyReport([FromQuery] string classroomId, [FromQuery] DateTime? date = null)
    {
        try
        {
            var targetDate = date ?? DateTime.UtcNow.Date;
            var sessionId = $"{classroomId}-{targetDate:yyyyMMdd}";

            var riskCards = await _analyticsService.GenerateStudentRiskCardsAsync(sessionId);
            var baseline = await _analyticsService.CalculateClassroomBaselineAsync(classroomId);

            var report = new DailyReport
            {
                ClassroomId = classroomId,
                Date = targetDate,
                SessionId = sessionId,
                Summary = new ReportSummary
                {
                    TotalStudents = riskCards.Count,
                    HighRiskStudents = riskCards.Count(c => c.CurrentRisk.RiskLevel == "HIGH"),
                    MediumRiskStudents = riskCards.Count(c => c.CurrentRisk.RiskLevel == "MEDIUM"),
                    LowRiskStudents = riskCards.Count(c => c.CurrentRisk.RiskLevel == "LOW"),
                    AverageRiskScore = riskCards.Any() ? riskCards.Average(c => c.CurrentRisk.RiskScore) : 0
                },
                Baseline = baseline,
                RiskCards = riskCards,
                GeneratedAt = DateTime.UtcNow
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating daily report");
            return StatusCode(500, "Error generating report");
        }
    }

    private List<string> GetTopRiskFactors(List<StudentRiskCard> riskCards)
    {
        return riskCards
            .SelectMany(c => c.CurrentRisk.RiskFactors)
            .GroupBy(f => f)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => $"{g.Key} ({g.Count()} students)")
            .ToList();
    }

    private string CalculateRiskLevel(double movementIntensity, double attentionRatio)
    {
        // Simple risk calculation for timeline
        var movementRisk = movementIntensity > 0.7 ? 1 : 0;
        var attentionRisk = attentionRatio < 0.6 ? 1 : 0;
        var totalRisk = movementRisk + attentionRisk;

        return totalRisk >= 2 ? "HIGH" : totalRisk == 1 ? "MEDIUM" : "LOW";
    }
}

public class DashboardOverview
{
    public string ClassroomId { get; set; } = string.Empty;
    public ClassroomBaseline Baseline { get; set; } = new();
    public SessionSummary RecentSession { get; set; } = new();
    public List<string> TopRiskFactors { get; set; } = new();
    public DateTime LastUpdated { get; set; }
}

public class SessionSummary
{
    public string SessionId { get; set; } = string.Empty;
    public string ClassroomId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public int HighRiskCount { get; set; }
    public int MediumRiskCount { get; set; }
    public int LowRiskCount { get; set; }
    public double AverageRiskScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime Timestamp { get; set; }
}

public class TimelinePoint
{
    public DateTime Timestamp { get; set; }
    public double MovementIntensity { get; set; }
    public double AttentionRatio { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
}

public class ClassroomHeatmap
{
    public string ClassroomId { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public List<StudentPosition> StudentPositions { get; set; } = new();
}

public class StudentPosition
{
    public string StudentId { get; set; } = string.Empty;
    public int X { get; set; }
    public int Y { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public double RiskScore { get; set; }
}

public class DashboardAlert
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public bool IsRead { get; set; }
}

public class DailyReport
{
    public string ClassroomId { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public ReportSummary Summary { get; set; } = new();
    public ClassroomBaseline Baseline { get; set; } = new();
    public List<StudentRiskCard> RiskCards { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
}

public class ReportSummary
{
    public int TotalStudents { get; set; }
    public int HighRiskStudents { get; set; }
    public int MediumRiskStudents { get; set; }
    public int LowRiskStudents { get; set; }
    public double AverageRiskScore { get; set; }
}
