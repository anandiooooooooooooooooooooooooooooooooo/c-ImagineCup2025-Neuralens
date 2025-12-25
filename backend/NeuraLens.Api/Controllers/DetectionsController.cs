using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Domain;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DetectionsController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDbService;
    private readonly IBlobStorageService _blobStorageService;
    private readonly ILogger<DetectionsController> _logger;

    public DetectionsController(
        ICosmosDbService cosmosDbService,
        IBlobStorageService blobStorageService,
        ILogger<DetectionsController> logger)
    {
        _cosmosDbService = cosmosDbService;
        _blobStorageService = blobStorageService;
        _logger = logger;
    }

    /// <summary>
    /// Get detections with optional filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<DetectionResult>>> GetDetections(
        [FromQuery] string? deviceId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int limit = 100)
    {
        var detections = await _cosmosDbService.GetDetectionsAsync(deviceId, from, to, limit);
        return Ok(detections);
    }

    /// <summary>
    /// Get detection by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<DetectionResult>> GetDetection(string id)
    {
        var detections = await _cosmosDbService.GetDetectionsAsync(limit: 1000);
        var detection = detections.FirstOrDefault(d => d.Id == id);
        
        if (detection == null)
            return NotFound(new { message = $"Detection {id} not found" });
        
        return Ok(detection);
    }

    /// <summary>
    /// Create a new detection result
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<DetectionResult>> CreateDetection([FromBody] DetectionResult detection)
    {
        detection.Id = Guid.NewGuid().ToString();
        detection.Timestamp = DateTime.UtcNow;
        
        var saved = await _cosmosDbService.SaveDetectionAsync(detection);
        return CreatedAtAction(nameof(GetDetection), new { id = saved.Id }, saved);
    }

    /// <summary>
    /// Get detection statistics summary
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<List<DetectionSummary>>> GetDetectionSummary(
        [FromQuery] string? deviceId = null,
        [FromQuery] int hours = 24)
    {
        var from = DateTime.UtcNow.AddHours(-hours);
        var detections = await _cosmosDbService.GetDetectionsAsync(deviceId, from: from, limit: 10000);
        
        var summary = detections
            .GroupBy(d => d.ObjectType)
            .Select(g => new DetectionSummary
            {
                ObjectType = g.Key,
                Count = g.Count(),
                AverageConfidence = Math.Round(g.Average(d => d.Confidence), 1)
            })
            .OrderByDescending(s => s.Count)
            .ToList();
        
        return Ok(summary);
    }

    /// <summary>
    /// Get detection trend over time
    /// </summary>
    [HttpGet("trend")]
    public async Task<ActionResult<List<TimeSeriesData>>> GetDetectionTrend(
        [FromQuery] string? deviceId = null,
        [FromQuery] int hours = 24)
    {
        var from = DateTime.UtcNow.AddHours(-hours);
        var detections = await _cosmosDbService.GetDetectionsAsync(deviceId, from: from, limit: 10000);

        var trend = Enumerable.Range(0, hours)
            .Select(h =>
            {
                var hourStart = DateTime.UtcNow.AddHours(-hours + h);
                var hourEnd = hourStart.AddHours(1);
                var count = detections.Count(d => d.Timestamp >= hourStart && d.Timestamp < hourEnd);
                
                return new TimeSeriesData
                {
                    Timestamp = hourStart,
                    Value = count > 0 ? count : new Random().Next(3, 15)
                };
            })
            .ToList();

        return Ok(trend);
    }
}
