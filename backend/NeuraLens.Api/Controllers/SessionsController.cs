using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Models;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly ICosmosDbService _cosmosService;
    private readonly IComputerVisionService _cvService;
    private readonly ILogger<SessionsController> _logger;

    public SessionsController(
        ICosmosDbService cosmosService,
        IComputerVisionService cvService,
        ILogger<SessionsController> logger)
    {
        _cosmosService = cosmosService;
        _cvService = cvService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
    {
        try
        {
            var sessionId = $"{request.ClassroomId}-{DateTime.UtcNow:yyyyMMdd-HHmmss}";

            var session = new VideoProcessingRequest
            {
                SessionId = sessionId,
                ClassroomId = request.ClassroomId,
                ExpectedStudentCount = request.ExpectedStudentCount,
                AnonymizationMethod = request.AnonymizationMethod,
                Status = "created",
                RequestedAt = DateTime.UtcNow
            };

            // Note: In a full implementation, save session to Cosmos DB
            // For now, just return the session info

            _logger.LogInformation("Created new session {SessionId} for classroom {ClassroomId}", sessionId, request.ClassroomId);

            return Ok(new
            {
                sessionId,
                classroomId = request.ClassroomId,
                status = "created",
                expectedStudentCount = request.ExpectedStudentCount,
                anonymizationMethod = request.AnonymizationMethod,
                createdAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating session");
            return StatusCode(500, "Error creating session");
        }
    }

    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetSession(string sessionId)
    {
        try
        {
            // Get processing status from CV engine
            var status = await _cvService.GetProcessingStatusAsync(sessionId);

            // Get behavioral features for this session
            var features = await _cosmosService.GetBehavioralFeaturesBySessionAsync(sessionId);

            var sessionInfo = new SessionDetails
            {
                SessionId = sessionId,
                Status = status,
                StudentCount = features.Select(f => f.StudentId).Distinct().Count(),
                FeaturesCount = features.Count,
                ProcessedAt = features.Any() ? features.Max(f => f.Timestamp) : null,
                LastUpdated = DateTime.UtcNow
            };

            return Ok(sessionInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving session {SessionId}", sessionId);
            return StatusCode(500, "Error retrieving session");
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions(
        [FromQuery] string? classroomId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int limit = 50)
    {
        try
        {
            // This is a simplified implementation
            // In a real system, you'd have a Sessions container in Cosmos DB

            var sessions = new List<SessionSummary>();

            // Mock some sessions for demonstration
            if (classroomId == null || classroomId == "default")
            {
                sessions.AddRange(new[]
                {
                    new SessionSummary
                    {
                        SessionId = $"default-{DateTime.UtcNow:yyyyMMdd}",
                        ClassroomId = "default",
                        Status = "completed",
                        StudentCount = 15,
                        CreatedAt = DateTime.UtcNow.Date,
                        ProcessedAt = DateTime.UtcNow
                    },
                    new SessionSummary
                    {
                        SessionId = $"default-{DateTime.UtcNow.AddDays(-1):yyyyMMdd}",
                        ClassroomId = "default",
                        Status = "completed",
                        StudentCount = 18,
                        CreatedAt = DateTime.UtcNow.AddDays(-1).Date,
                        ProcessedAt = DateTime.UtcNow.AddDays(-1)
                    }
                });
            }

            // Filter by date range if provided
            if (from.HasValue)
            {
                sessions = sessions.Where(s => s.CreatedAt >= from.Value.Date).ToList();
            }
            if (to.HasValue)
            {
                sessions = sessions.Where(s => s.CreatedAt <= to.Value.Date).ToList();
            }

            return Ok(sessions.OrderByDescending(s => s.CreatedAt).Take(limit));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sessions");
            return StatusCode(500, "Error retrieving sessions");
        }
    }

    [HttpDelete("{sessionId}")]
    public async Task<IActionResult> DeleteSession(string sessionId)
    {
        try
        {
            // In a full implementation, this would:
            // 1. Delete behavioral features from Cosmos DB
            // 2. Delete associated blob storage files
            // 3. Cancel any ongoing CV processing

            _logger.LogInformation("Session {SessionId} deletion requested", sessionId);

            // For now, just return success
            return Ok(new { sessionId, status = "deleted", deletedAt = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting session {SessionId}", sessionId);
            return StatusCode(500, "Error deleting session");
        }
    }

    [HttpPost("{sessionId}/cancel")]
    public async Task<IActionResult> CancelSession(string sessionId)
    {
        try
        {
            // In a full implementation, this would cancel ongoing CV processing
            _logger.LogInformation("Session {SessionId} cancellation requested", sessionId);

            return Ok(new { sessionId, status = "cancelled", cancelledAt = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling session {SessionId}", sessionId);
            return StatusCode(500, "Error cancelling session");
        }
    }

    [HttpGet("{sessionId}/export")]
    public async Task<IActionResult> ExportSessionData(string sessionId, [FromQuery] string format = "json")
    {
        try
        {
            var features = await _cosmosService.GetBehavioralFeaturesBySessionAsync(sessionId);

            if (!features.Any())
            {
                return NotFound("No data found for this session");
            }

            if (format.ToLower() == "csv")
            {
                // Generate CSV content
                var csv = GenerateCsvExport(features);
                return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", $"session-{sessionId}-export.csv");
            }
            else
            {
                // Return JSON
                return Ok(new
                {
                    sessionId,
                    exportFormat = "json",
                    recordCount = features.Count,
                    data = features,
                    exportedAt = DateTime.UtcNow
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting session {SessionId}", sessionId);
            return StatusCode(500, "Error exporting session data");
        }
    }

    private string GenerateCsvExport(List<BehavioralFeatures> features)
    {
        var csv = new System.Text.StringBuilder();
        csv.AppendLine("StudentId,Timestamp,MovementIntensityScore,MovementThreshold,MovementStatus,MovementEventCount,AttentionRatio,AttentionThreshold,AttentionStatus,AttentionLongestDuration,AttentionAverageDuration,SessionId");

        foreach (var feature in features)
        {
            csv.AppendLine($"{feature.StudentId},{feature.Timestamp:o},{feature.MovementIntensity.MovementIntensityScore},{feature.MovementIntensity.Threshold},{feature.MovementIntensity.Status},{feature.MovementIntensity.EventCount},{feature.AttentionDuration.AttentionRatio},{feature.AttentionDuration.Threshold},{feature.AttentionDuration.Status},{feature.AttentionDuration.LongestFocusDuration},{feature.AttentionDuration.AverageFocusDuration},{feature.SessionId}");
        }

        return csv.ToString();
    }
}

public class CreateSessionRequest
{
    public string ClassroomId { get; set; } = string.Empty;
    public int ExpectedStudentCount { get; set; } = 20;
    public string AnonymizationMethod { get; set; } = "blur";
}

public class SessionDetails
{
    public string SessionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public int FeaturesCount { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime LastUpdated { get; set; }
}