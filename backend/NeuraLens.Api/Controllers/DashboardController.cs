using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Domain;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStats>> GetStats()
    {
        var stats = await _dashboardService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    /// <summary>
    /// Get detection trend
    /// </summary>
    [HttpGet("trend")]
    public async Task<ActionResult<List<TimeSeriesData>>> GetTrend([FromQuery] int hours = 24)
    {
        var trend = await _dashboardService.GetDetectionTrendAsync(hours);
        return Ok(trend);
    }

    /// <summary>
    /// Get detection summary by object type
    /// </summary>
    [HttpGet("detection-summary")]
    public async Task<ActionResult<List<DetectionSummary>>> GetDetectionSummary()
    {
        var summary = await _dashboardService.GetDetectionSummaryAsync();
        return Ok(summary);
    }
}
