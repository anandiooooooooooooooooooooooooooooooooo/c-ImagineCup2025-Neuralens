using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Domain;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDbService;
    private readonly ILogger<AlertsController> _logger;

    public AlertsController(ICosmosDbService cosmosDbService, ILogger<AlertsController> logger)
    {
        _cosmosDbService = cosmosDbService;
        _logger = logger;
    }

    /// <summary>
    /// Get all alerts
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<Alert>>> GetAlerts(
        [FromQuery] bool? unreadOnly = null,
        [FromQuery] int limit = 50)
    {
        var alerts = await _cosmosDbService.GetAlertsAsync(unreadOnly, limit);
        return Ok(alerts);
    }

    /// <summary>
    /// Get unread alert count
    /// </summary>
    [HttpGet("unread/count")]
    public async Task<ActionResult> GetUnreadCount()
    {
        var alerts = await _cosmosDbService.GetAlertsAsync(unreadOnly: true);
        return Ok(new { count = alerts.Count });
    }

    /// <summary>
    /// Create a new alert
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Alert>> CreateAlert([FromBody] Alert alert)
    {
        alert.Id = Guid.NewGuid().ToString();
        alert.Timestamp = DateTime.UtcNow;
        alert.IsRead = false;
        alert.IsResolved = false;
        
        var saved = await _cosmosDbService.SaveAlertAsync(alert);
        return CreatedAtAction(nameof(GetAlerts), saved);
    }

    /// <summary>
    /// Mark an alert as read
    /// </summary>
    [HttpPatch("{alertId}/read")]
    public async Task<ActionResult> MarkAsRead(string alertId)
    {
        var success = await _cosmosDbService.MarkAlertAsReadAsync(alertId);
        if (!success)
            return BadRequest(new { message = "Failed to mark alert as read" });
        
        return Ok(new { message = "Alert marked as read" });
    }

    /// <summary>
    /// Resolve an alert
    /// </summary>
    [HttpPatch("{alertId}/resolve")]
    public async Task<ActionResult> ResolveAlert(string alertId)
    {
        var success = await _cosmosDbService.ResolveAlertAsync(alertId);
        if (!success)
            return BadRequest(new { message = "Failed to resolve alert" });
        
        return Ok(new { message = "Alert resolved" });
    }

    /// <summary>
    /// Mark all alerts as read
    /// </summary>
    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        var alerts = await _cosmosDbService.GetAlertsAsync(unreadOnly: true);
        foreach (var alert in alerts)
        {
            await _cosmosDbService.MarkAlertAsReadAsync(alert.Id);
        }
        
        return Ok(new { message = $"Marked {alerts.Count} alerts as read" });
    }
}
