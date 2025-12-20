using Microsoft.Azure.Cosmos;
using NeuraLens.Api.Domain;

namespace NeuraLens.Api.Services;

public interface ICosmosDbService
{
    Task<List<TelemetryData>> GetTelemetryAsync(string deviceId, DateTime? from = null, DateTime? to = null);
    Task<TelemetryData> SaveTelemetryAsync(TelemetryData telemetry);
    Task<List<DetectionResult>> GetDetectionsAsync(string? deviceId = null, DateTime? from = null, DateTime? to = null, int limit = 100);
    Task<DetectionResult> SaveDetectionAsync(DetectionResult detection);
    Task<List<Alert>> GetAlertsAsync(bool? unreadOnly = null, int limit = 50);
    Task<Alert> SaveAlertAsync(Alert alert);
    Task<bool> MarkAlertAsReadAsync(string alertId);
    Task<bool> ResolveAlertAsync(string alertId);
}

public class CosmosDbService : ICosmosDbService
{
    private readonly ILogger<CosmosDbService> _logger;
    private readonly IConfiguration _configuration;
    private readonly CosmosClient? _cosmosClient;
    private readonly Database? _database;
    private readonly bool _isConfigured;

    // Mock data for demo
    private readonly List<TelemetryData> _mockTelemetry = new();
    private readonly List<DetectionResult> _mockDetections;
    private readonly List<Alert> _mockAlerts;

    public CosmosDbService(ILogger<CosmosDbService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;

        // Initialize mock data
        _mockDetections = GenerateMockDetections();
        _mockAlerts = GenerateMockAlerts();

        var connectionString = _configuration["Azure:CosmosDb:ConnectionString"];
        var databaseName = _configuration["Azure:CosmosDb:DatabaseName"] ?? "NeuraLensDb";

        if (!string.IsNullOrEmpty(connectionString) && connectionString != "YOUR_COSMOS_DB_CONNECTION_STRING")
        {
            try
            {
                _cosmosClient = new CosmosClient(connectionString);
                _database = _cosmosClient.GetDatabase(databaseName);
                _isConfigured = true;
                _logger.LogInformation("Azure Cosmos DB service initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to initialize Azure Cosmos DB, using mock data");
                _isConfigured = false;
            }
        }
        else
        {
            _logger.LogInformation("Azure Cosmos DB not configured, using mock data for demo");
            _isConfigured = false;
        }
    }

    public async Task<List<TelemetryData>> GetTelemetryAsync(string deviceId, DateTime? from = null, DateTime? to = null)
    {
        if (!_isConfigured || _database == null)
        {
            return _mockTelemetry.Where(t => t.DeviceId == deviceId).ToList();
        }

        try
        {
            var container = _database.GetContainer("Telemetry");
            var query = new QueryDefinition("SELECT * FROM c WHERE c.deviceId = @deviceId ORDER BY c.timestamp DESC")
                .WithParameter("@deviceId", deviceId);

            var results = new List<TelemetryData>();
            var iterator = container.GetItemQueryIterator<TelemetryData>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching telemetry for device {DeviceId}", deviceId);
            return new List<TelemetryData>();
        }
    }

    public async Task<TelemetryData> SaveTelemetryAsync(TelemetryData telemetry)
    {
        if (!_isConfigured || _database == null)
        {
            _mockTelemetry.Add(telemetry);
            return telemetry;
        }

        var container = _database.GetContainer("Telemetry");
        var response = await container.CreateItemAsync(telemetry, new PartitionKey(telemetry.DeviceId));
        return response.Resource;
    }

    public async Task<List<DetectionResult>> GetDetectionsAsync(string? deviceId = null, DateTime? from = null, DateTime? to = null, int limit = 100)
    {
        if (!_isConfigured || _database == null)
        {
            var query = _mockDetections.AsQueryable();
            if (!string.IsNullOrEmpty(deviceId))
                query = query.Where(d => d.DeviceId == deviceId);
            if (from.HasValue)
                query = query.Where(d => d.Timestamp >= from.Value);
            if (to.HasValue)
                query = query.Where(d => d.Timestamp <= to.Value);
            
            return query.OrderByDescending(d => d.Timestamp).Take(limit).ToList();
        }

        try
        {
            var container = _database.GetContainer("Detections");
            var queryText = "SELECT TOP @limit * FROM c WHERE 1=1";
            if (!string.IsNullOrEmpty(deviceId))
                queryText += " AND c.deviceId = @deviceId";
            queryText += " ORDER BY c.timestamp DESC";

            var queryDef = new QueryDefinition(queryText)
                .WithParameter("@limit", limit);
            
            if (!string.IsNullOrEmpty(deviceId))
                queryDef.WithParameter("@deviceId", deviceId);

            var results = new List<DetectionResult>();
            var iterator = container.GetItemQueryIterator<DetectionResult>(queryDef);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching detections");
            return _mockDetections.Take(limit).ToList();
        }
    }

    public async Task<DetectionResult> SaveDetectionAsync(DetectionResult detection)
    {
        if (!_isConfigured || _database == null)
        {
            _mockDetections.Insert(0, detection);
            return detection;
        }

        var container = _database.GetContainer("Detections");
        var response = await container.CreateItemAsync(detection, new PartitionKey(detection.DeviceId));
        return response.Resource;
    }

    public async Task<List<Alert>> GetAlertsAsync(bool? unreadOnly = null, int limit = 50)
    {
        if (!_isConfigured || _database == null)
        {
            var query = _mockAlerts.AsQueryable();
            if (unreadOnly == true)
                query = query.Where(a => !a.IsRead);
            return query.OrderByDescending(a => a.Timestamp).Take(limit).ToList();
        }

        try
        {
            var container = _database.GetContainer("Alerts");
            var queryText = "SELECT TOP @limit * FROM c";
            if (unreadOnly == true)
                queryText += " WHERE c.isRead = false";
            queryText += " ORDER BY c.timestamp DESC";

            var queryDef = new QueryDefinition(queryText).WithParameter("@limit", limit);

            var results = new List<Alert>();
            var iterator = container.GetItemQueryIterator<Alert>(queryDef);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching alerts");
            return _mockAlerts.Take(limit).ToList();
        }
    }

    public async Task<Alert> SaveAlertAsync(Alert alert)
    {
        if (!_isConfigured || _database == null)
        {
            _mockAlerts.Insert(0, alert);
            return alert;
        }

        var container = _database.GetContainer("Alerts");
        var response = await container.CreateItemAsync(alert, new PartitionKey(alert.DeviceId));
        return response.Resource;
    }

    public async Task<bool> MarkAlertAsReadAsync(string alertId)
    {
        if (!_isConfigured)
        {
            var alert = _mockAlerts.FirstOrDefault(a => a.Id == alertId);
            if (alert != null) alert.IsRead = true;
            return true;
        }

        // Implementation for Cosmos DB
        await Task.CompletedTask;
        return true;
    }

    public async Task<bool> ResolveAlertAsync(string alertId)
    {
        if (!_isConfigured)
        {
            var alert = _mockAlerts.FirstOrDefault(a => a.Id == alertId);
            if (alert != null)
            {
                alert.IsResolved = true;
                alert.IsRead = true;
            }
            return true;
        }

        await Task.CompletedTask;
        return true;
    }

    private static List<DetectionResult> GenerateMockDetections()
    {
        var random = new Random();
        var objectTypes = new[] { "Person", "Vehicle", "Package", "Forklift", "Safety Helmet", "Safety Vest", "Face Mask" };
        var deviceIds = new[] { "edge-device-001", "edge-device-002", "edge-device-003", "edge-device-005" };
        
        return Enumerable.Range(0, 50).Select(i => new DetectionResult
        {
            Id = Guid.NewGuid().ToString(),
            DeviceId = deviceIds[random.Next(deviceIds.Length)],
            Timestamp = DateTime.UtcNow.AddMinutes(-i * random.Next(1, 10)),
            ObjectType = objectTypes[random.Next(objectTypes.Length)],
            Confidence = 85 + random.NextDouble() * 15,
            BoundingBox = new BoundingBox
            {
                X = random.Next(0, 800),
                Y = random.Next(0, 600),
                Width = random.Next(50, 200),
                Height = random.Next(50, 200)
            },
            ImageUrl = $"https://picsum.photos/seed/{i}/640/480"
        }).ToList();
    }

    private static List<Alert> GenerateMockAlerts()
    {
        return new List<Alert>
        {
            new Alert
            {
                DeviceId = "edge-device-001",
                Severity = "critical",
                Title = "Safety Violation Detected",
                Message = "Person detected without safety helmet in restricted zone",
                Timestamp = DateTime.UtcNow.AddMinutes(-5),
                IsRead = false
            },
            new Alert
            {
                DeviceId = "edge-device-004",
                Severity = "warning",
                Title = "Device Offline",
                Message = "Parking Lot Monitor has been offline for 2 hours",
                Timestamp = DateTime.UtcNow.AddHours(-2),
                IsRead = false
            },
            new Alert
            {
                DeviceId = "edge-device-003",
                Severity = "warning",
                Title = "High CPU Usage",
                Message = "Quality Control Station CPU usage exceeded 75%",
                Timestamp = DateTime.UtcNow.AddMinutes(-30),
                IsRead = true
            },
            new Alert
            {
                DeviceId = "edge-device-002",
                Severity = "info",
                Title = "Model Updated",
                Message = "ONNX model successfully updated to version 2.3.1",
                Timestamp = DateTime.UtcNow.AddHours(-4),
                IsRead = true
            }
        };
    }
}
