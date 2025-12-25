using Microsoft.AspNetCore.Mvc;
using NeuraLens.Api.Domain;
using NeuraLens.Api.Services;

namespace NeuraLens.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DevicesController : ControllerBase
{
    private readonly IIoTHubService _iotHubService;
    private readonly ILogger<DevicesController> _logger;

    public DevicesController(IIoTHubService iotHubService, ILogger<DevicesController> logger)
    {
        _iotHubService = iotHubService;
        _logger = logger;
    }

    /// <summary>
    /// Get all IoT devices
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<EdgeDevice>>> GetAllDevices()
    {
        var devices = await _iotHubService.GetAllDevicesAsync();
        return Ok(devices);
    }

    /// <summary>
    /// Get a specific device by ID
    /// </summary>
    [HttpGet("{deviceId}")]
    public async Task<ActionResult<EdgeDevice>> GetDevice(string deviceId)
    {
        var device = await _iotHubService.GetDeviceAsync(deviceId);
        if (device == null)
            return NotFound(new { message = $"Device {deviceId} not found" });
        
        return Ok(device);
    }

    /// <summary>
    /// Get device metrics
    /// </summary>
    [HttpGet("{deviceId}/metrics")]
    public async Task<ActionResult<DeviceMetrics>> GetDeviceMetrics(string deviceId)
    {
        var metrics = await _iotHubService.GetDeviceMetricsAsync(deviceId);
        if (metrics == null)
            return NotFound(new { message = $"Metrics for device {deviceId} not found" });
        
        return Ok(metrics);
    }

    /// <summary>
    /// Send command to device
    /// </summary>
    [HttpPost("{deviceId}/command")]
    public async Task<ActionResult> SendCommand(string deviceId, [FromBody] DeviceCommandRequest request)
    {
        var success = await _iotHubService.SendCommandAsync(deviceId, request.Command, request.Payload);
        if (!success)
            return BadRequest(new { message = "Failed to send command to device" });
        
        return Ok(new { message = "Command sent successfully" });
    }

    /// <summary>
    /// Update device twin properties
    /// </summary>
    [HttpPatch("{deviceId}/twin")]
    public async Task<ActionResult> UpdateDeviceTwin(string deviceId, [FromBody] Dictionary<string, object> properties)
    {
        var success = await _iotHubService.UpdateDeviceTwinAsync(deviceId, properties);
        if (!success)
            return BadRequest(new { message = "Failed to update device twin" });
        
        return Ok(new { message = "Device twin updated successfully" });
    }
}

public class DeviceCommandRequest
{
    public string Command { get; set; } = string.Empty;
    public object Payload { get; set; } = new { };
}
