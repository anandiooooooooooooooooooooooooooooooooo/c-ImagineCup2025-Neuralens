// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Modified for NeuraLens - ADHD/ASD Early Detection System

using ChatApp.WebApi.Models;
using ChatApp.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.WebApi.Controllers;

[ApiController]
[Route("api/behavioral-analytics")]
public class BehavioralAnalyticsController : ControllerBase
{
    private readonly IComputerVisionService _cvService;
    private readonly IRiskScoringEngine _riskEngine;
    private readonly ILogger<BehavioralAnalyticsController> _logger;

    public BehavioralAnalyticsController(
        IComputerVisionService cvService,
        IRiskScoringEngine riskEngine,
        ILogger<BehavioralAnalyticsController> logger)
    {
        _cvService = cvService;
        _riskEngine = riskEngine;
        _logger = logger;
    }

    /// <summary>
    /// Process uploaded video for behavioral analysis
    /// </summary>
    [HttpPost("process-video")]
    [RequestSizeLimit(500_000_000)] // 500MB limit
    public async Task<ActionResult<ProcessVideoResponse>> ProcessVideo(
        [FromForm] IFormFile video,
        [FromForm] string sessionId,
        [FromForm] string className,
        [FromForm] string activityType)
    {
        try
        {
            if (video == null || video.Length == 0)
            {
                return BadRequest(new { error = "No video file provided" });
            }

            _logger.LogInformation("Processing video upload. SessionId: {SessionId}, FileName: {FileName}, Size: {Size}",
                sessionId, video.FileName, video.Length);

            // Send video to CV engine
            using var stream = video.OpenReadStream();
            var cvResponse = await _cvService.ProcessVideoAsync(stream, sessionId, video.FileName);

            // Calculate risk assessments for each student
            var riskAssessments = cvResponse.Students
                .Select(student => _riskEngine.CalculateRiskAssessment(student, sessionId))
                .ToList();

            var response = new ProcessVideoResponse
            {
                SessionId = sessionId,
                ClassName = className,
                ActivityType = activityType,
                StudentsAnalyzed = cvResponse.Students.Count,
                ProcessingTime = cvResponse.ProcessingTime,
                FramesProcessed = cvResponse.FramesProcessed,
                RiskAssessments = riskAssessments
            };

            _logger.LogInformation("Video processing completed. SessionId: {SessionId}, StudentsAnalyzed: {Count}",
                sessionId, response.StudentsAnalyzed);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing video. SessionId: {SessionId}", sessionId);
            return StatusCode(500, new { error = "Failed to process video", details = ex.Message });
        }
    }

    /// <summary>
    /// Get processing status for a session
    /// </summary>
    [HttpGet("processing-status/{sessionId}")]
    public async Task<ActionResult<VideoProcessingStatus>> GetProcessingStatus(string sessionId)
    {
        try
        {
            var status = await _cvService.GetProcessingStatusAsync(sessionId);
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting processing status. SessionId: {SessionId}", sessionId);
            return StatusCode(500, new { error = "Failed to get processing status" });
        }
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    public async Task<ActionResult> HealthCheck()
    {
        var cvEngineHealthy = await _cvService.HealthCheckAsync();
        
        var health = new
        {
            status = cvEngineHealthy ? "healthy" : "degraded",
            timestamp = DateTime.UtcNow,
            components = new
            {
                cvEngine = cvEngineHealthy ? "healthy" : "unhealthy",
                riskEngine = "healthy"
            }
        };

        return cvEngineHealthy ? Ok(health) : StatusCode(503, health);
    }
}

/// <summary>
/// Response model for video processing
/// </summary>
public record ProcessVideoResponse
{
    public required string SessionId { get; init; }
    public required string ClassName { get; init; }
    public required string ActivityType { get; init; }
    public required int StudentsAnalyzed { get; init; }
    public required double ProcessingTime { get; init; }
    public required int FramesProcessed { get; init; }
    public required List<RiskAssessment> RiskAssessments { get; init; }
}
