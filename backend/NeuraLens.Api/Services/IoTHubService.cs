using Microsoft.Azure.Devices;
using Microsoft.Azure.Devices.Shared;
using NeuraLens.Api.Domain;

namespace NeuraLens.Api.Services;

public interface IIoTHubService
{
    Task<List<EdgeDevice>> GetAllDevicesAsync();
    Task<EdgeDevice?> GetDeviceAsync(string deviceId);
    Task<DeviceMetrics?> GetDeviceMetricsAsync(string deviceId);
    Task<bool> SendCommandAsync(string deviceId, string command, object payload);
    Task<bool> UpdateDeviceTwinAsync(string deviceId, Dictionary<string, object> properties);
}

public class IoTHubService : IIoTHubService
{
    private readonly ILogger<IoTHubService> _logger;
    private readonly IConfiguration _configuration;
    private readonly RegistryManager? _registryManager;
    private readonly ServiceClient? _serviceClient;
    private readonly bool _isConfigured;

    // Mock data for demo when Azure is not configured
    private readonly List<EdgeDevice> _mockDevices = new()
    {
        new EdgeDevice
        {
            Id = "edge-device-001",
            Name = "Factory Floor Camera 1",
            DeviceType = "Azure IoT Edge",
            Status = "online",
            LastSeen = DateTime.UtcNow.AddMinutes(-1),
            Location = "Building A - Section 1",
            Metrics = new DeviceMetrics
            {
                CpuUsage = 45.5,
                MemoryUsage = 62.3,
                Temperature = 42.1,
                FramesProcessed = 28450,
                InferenceLatency = 23.5,
                Accuracy = 97.8
            }
        },
        new EdgeDevice
        {
            Id = "edge-device-002",
            Name = "Warehouse Entrance Camera",
            DeviceType = "Azure IoT Edge",
            Status = "online",
            LastSeen = DateTime.UtcNow.AddMinutes(-2),
            Location = "Warehouse - Main Entrance",
            Metrics = new DeviceMetrics
            {
                CpuUsage = 38.2,
                MemoryUsage = 55.8,
                Temperature = 38.7,
                FramesProcessed = 21340,
                InferenceLatency = 19.8,
                Accuracy = 98.2
            }
        },
        new EdgeDevice
        {
            Id = "edge-device-003",
            Name = "Quality Control Station",
            DeviceType = "Azure IoT Edge",
            Status = "online",
            LastSeen = DateTime.UtcNow,
            Location = "Building B - QC Area",
            Metrics = new DeviceMetrics
            {
                CpuUsage = 78.9,
                MemoryUsage = 71.2,
                Temperature = 48.3,
                FramesProcessed = 45670,
                InferenceLatency = 31.2,
                Accuracy = 99.1
            }
        },
        new EdgeDevice
        {
            Id = "edge-device-004",
            Name = "Parking Lot Monitor",
            DeviceType = "Azure IoT Edge",
            Status = "offline",
            LastSeen = DateTime.UtcNow.AddHours(-2),
            Location = "Outdoor - Parking Area",
            Metrics = new DeviceMetrics
            {
                CpuUsage = 0,
                MemoryUsage = 0,
                Temperature = 0,
                FramesProcessed = 12890,
                InferenceLatency = 0,
                Accuracy = 95.6
            }
        },
        new EdgeDevice
        {
            Id = "edge-device-005",
            Name = "Assembly Line Camera",
            DeviceType = "Azure IoT Edge",
            Status = "online",
            LastSeen = DateTime.UtcNow.AddSeconds(-30),
            Location = "Building A - Assembly Line",
            Metrics = new DeviceMetrics
            {
                CpuUsage = 52.1,
                MemoryUsage = 58.9,
                Temperature = 44.2,
                FramesProcessed = 38920,
                InferenceLatency = 25.6,
                Accuracy = 97.4
            }
        }
    };

    public IoTHubService(ILogger<IoTHubService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;

        var connectionString = _configuration["Azure:IoTHub:ConnectionString"];
        if (!string.IsNullOrEmpty(connectionString) && connectionString != "YOUR_IOT_HUB_CONNECTION_STRING")
        {
            try
            {
                _registryManager = RegistryManager.CreateFromConnectionString(connectionString);
                _serviceClient = ServiceClient.CreateFromConnectionString(connectionString);
                _isConfigured = true;
                _logger.LogInformation("Azure IoT Hub service initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to initialize Azure IoT Hub, using mock data");
                _isConfigured = false;
            }
        }
        else
        {
            _logger.LogInformation("Azure IoT Hub not configured, using mock data for demo");
            _isConfigured = false;
        }
    }

    public async Task<List<EdgeDevice>> GetAllDevicesAsync()
    {
        if (!_isConfigured || _registryManager == null)
        {
            return _mockDevices;
        }

        try
        {
            var devices = new List<EdgeDevice>();
            var query = _registryManager.CreateQuery("SELECT * FROM devices", 100);

            while (query.HasMoreResults)
            {
                var twins = await query.GetNextAsTwinAsync();
                foreach (var twin in twins)
                {
                    devices.Add(MapTwinToDevice(twin));
                }
            }

            return devices;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching devices from IoT Hub");
            return _mockDevices;
        }
    }

    public async Task<EdgeDevice?> GetDeviceAsync(string deviceId)
    {
        if (!_isConfigured || _registryManager == null)
        {
            return _mockDevices.FirstOrDefault(d => d.Id == deviceId);
        }

        try
        {
            var twin = await _registryManager.GetTwinAsync(deviceId);
            return twin != null ? MapTwinToDevice(twin) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching device {DeviceId}", deviceId);
            return _mockDevices.FirstOrDefault(d => d.Id == deviceId);
        }
    }

    public async Task<DeviceMetrics?> GetDeviceMetricsAsync(string deviceId)
    {
        var device = await GetDeviceAsync(deviceId);
        return device?.Metrics;
    }

    public async Task<bool> SendCommandAsync(string deviceId, string command, object payload)
    {
        if (!_isConfigured || _serviceClient == null)
        {
            _logger.LogInformation("Mock: Sending command {Command} to device {DeviceId}", command, deviceId);
            return true;
        }

        try
        {
            var methodInvocation = new CloudToDeviceMethod(command)
            {
                ResponseTimeout = TimeSpan.FromSeconds(30)
            };
            methodInvocation.SetPayloadJson(System.Text.Json.JsonSerializer.Serialize(payload));

            var response = await _serviceClient.InvokeDeviceMethodAsync(deviceId, methodInvocation);
            return response.Status == 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending command to device {DeviceId}", deviceId);
            return false;
        }
    }

    public async Task<bool> UpdateDeviceTwinAsync(string deviceId, Dictionary<string, object> properties)
    {
        if (!_isConfigured || _registryManager == null)
        {
            _logger.LogInformation("Mock: Updating twin for device {DeviceId}", deviceId);
            return true;
        }

        try
        {
            var twin = await _registryManager.GetTwinAsync(deviceId);
            foreach (var prop in properties)
            {
                twin.Properties.Desired[prop.Key] = prop.Value;
            }
            await _registryManager.UpdateTwinAsync(deviceId, twin, twin.ETag);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating device twin for {DeviceId}", deviceId);
            return false;
        }
    }

    private static EdgeDevice MapTwinToDevice(Twin twin)
    {
        var status = twin.ConnectionState == DeviceConnectionState.Connected ? "online" : "offline";
        
        return new EdgeDevice
        {
            Id = twin.DeviceId,
            Name = twin.Properties.Reported.Contains("name") 
                ? twin.Properties.Reported["name"].ToString() ?? twin.DeviceId 
                : twin.DeviceId,
            DeviceType = "Azure IoT Edge",
            Status = status,
            LastSeen = twin.LastActivityTime ?? DateTime.UtcNow,
            Location = twin.Properties.Reported.Contains("location")
                ? twin.Properties.Reported["location"].ToString() ?? "Unknown"
                : "Unknown"
        };
    }
}
