using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Models;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideoController : ControllerBase
{
    private readonly IComputerVisionService _cvService;
    private readonly IBlobStorageService _blobService;
    private readonly ICosmosDbService _cosmosService;
    private readonly ILogger<VideoController> _logger;

    public VideoController(
        IComputerVisionService cvService,
        IBlobStorageService blobService,
        ICosmosDbService cosmosService,
        ILogger<VideoController> logger)
    {
        _cvService = cvService;
        _blobService = blobService;
        _cosmosService = cosmosService;
        _logger = logger;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(500 * 1024 * 1024)] // 500MB limit
    public async Task<IActionResult> UploadVideo(
        IFormFile videoFile,
        [FromForm] string sessionId,
        [FromForm] string classroomId = "default",
        [FromForm] string anonymizationMethod = "blur")
    {
        if (videoFile == null || videoFile.Length == 0)
        {
            return BadRequest("No video file provided");
        }

        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return BadRequest("Session ID is required");
        }

        try
        {
            _logger.LogInformation("Starting video upload for session {SessionId}", sessionId);

            // Generate unique blob name
            var blobName = $"{sessionId}/{Guid.NewGuid()}.mp4";

            // Upload to blob storage
            using var stream = videoFile.OpenReadStream();
            var videoUrl = await _blobService.UploadImageAsync("videos", blobName, stream, "video/mp4");

            // Create processing request record
            var request = new VideoProcessingRequest
            {
                SessionId = sessionId,
                VideoUrl = videoUrl,
                ClassroomId = classroomId,
                AnonymizationMethod = anonymizationMethod,
                Status = "uploaded"
            };

            // Note: We don't save VideoProcessingRequest to Cosmos yet, as we don't have a container for it
            // In a full implementation, you'd create a container for processing requests

            _logger.LogInformation("Video uploaded successfully for session {SessionId}", sessionId);

            return Ok(new
            {
                sessionId,
                videoUrl,
                status = "uploaded",
                message = "Video uploaded successfully. Processing will begin shortly."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading video for session {SessionId}", sessionId);
            return StatusCode(500, "Error uploading video");
        }
    }

    [HttpPost("process/{sessionId}")]
    public async Task<IActionResult> ProcessVideo(string sessionId, [FromBody] VideoProcessingRequest request)
    {
        try
        {
            _logger.LogInformation("Starting video processing for session {SessionId}", sessionId);

            // Call CV Engine
            var result = await _cvService.ProcessVideoAsync(
                request.VideoUrl,
                sessionId,
                request.AnonymizationMethod);

            // Save behavioral features to Cosmos DB
            foreach (var feature in result.Students)
            {
                await _cosmosService.SaveBehavioralFeaturesAsync(feature);
            }

            _logger.LogInformation("Video processing completed for session {SessionId}", sessionId);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing video for session {SessionId}", sessionId);
            return StatusCode(500, new { error = "Processing failed", message = ex.Message });
        }
    }

    [HttpGet("status/{sessionId}")]
    public async Task<IActionResult> GetProcessingStatus(string sessionId)
    {
        try
        {
            var status = await _cvService.GetProcessingStatusAsync(sessionId);

            return Ok(new
            {
                sessionId,
                status,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting processing status for session {SessionId}", sessionId);
            return StatusCode(500, "Error retrieving status");
        }
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions([FromQuery] string? classroomId = null, [FromQuery] int limit = 50)
    {
        try
        {
            // This would require a container for VideoProcessingRequest
            // For now, return mock data
            var mockSessions = new List<object>
            {
                new { sessionId = "classroom-001-20241227", classroomId = "classroom-001", status = "completed", timestamp = DateTime.UtcNow },
                new { sessionId = "classroom-002-20241227", classroomId = "classroom-002", status = "processing", timestamp = DateTime.UtcNow }
            };

            var filteredSessions = string.IsNullOrEmpty(classroomId) ?
                mockSessions :
                mockSessions.Where(s => s.ToString()!.Contains(classroomId)).ToList();

            return Ok(filteredSessions.Take(limit));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sessions");
            return StatusCode(500, "Error retrieving sessions");
        }
    }
}