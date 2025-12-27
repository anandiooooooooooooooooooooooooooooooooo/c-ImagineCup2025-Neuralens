using Microsoft.Azure.Cosmos;
using NeuraLens.Api.Domain;
using NeuraLens.Api.Models;

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

    // New methods for NeuraLens behavioral analytics
    Task<BehavioralFeatures> SaveBehavioralFeaturesAsync(BehavioralFeatures features);
    Task<List<BehavioralFeatures>> GetBehavioralFeaturesBySessionAsync(string sessionId);
    Task<List<BehavioralFeatures>> GetBehavioralFeaturesByStudentAsync(string studentId, DateTime startDate, DateTime endDate);
    Task<List<BehavioralFeatures>> GetBehavioralFeaturesByClassroomAsync(string classroomId, string timeWindow);
}

public class CosmosDbService : ICosmosDbService
{
    private readonly ILogger<CosmosDbService> _logger;
    private readonly IConfiguration _configuration;
    private readonly CosmosClient? _cosmosClient;
    private readonly Database? _database;
    private readonly bool _isConfigured;


    public CosmosDbService(ILogger<CosmosDbService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;

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
                _logger.LogWarning(ex, "Failed to initialize Azure Cosmos DB");
                _isConfigured = false;
            }
        }
        else
        {
            _logger.LogInformation("Azure Cosmos DB not configured");
            _isConfigured = false;
        }
    }

    public async Task<List<TelemetryData>> GetTelemetryAsync(string deviceId, DateTime? from = null, DateTime? to = null)
    {
        if (!_isConfigured || _database == null)
        {
            return new List<TelemetryData>();
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
            throw new InvalidOperationException("Cosmos DB not configured");
        }

        var container = _database.GetContainer("Telemetry");
        var response = await container.CreateItemAsync(telemetry, new PartitionKey(telemetry.DeviceId));
        return response.Resource;
    }

    public async Task<List<DetectionResult>> GetDetectionsAsync(string? deviceId = null, DateTime? from = null, DateTime? to = null, int limit = 100)
    {
        if (!_isConfigured || _database == null)
        {
            return new List<DetectionResult>();
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
            return new List<DetectionResult>();
        }
    }

    public async Task<DetectionResult> SaveDetectionAsync(DetectionResult detection)
    {
        if (!_isConfigured || _database == null)
        {
            throw new InvalidOperationException("Cosmos DB not configured");
        }

        var container = _database.GetContainer("Detections");
        var response = await container.CreateItemAsync(detection, new PartitionKey(detection.DeviceId));
        return response.Resource;
    }

    public async Task<List<Alert>> GetAlertsAsync(bool? unreadOnly = null, int limit = 50)
    {
        if (!_isConfigured || _database == null)
        {
            return new List<Alert>();
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
            return new List<Alert>();
        }
    }

    public async Task<Alert> SaveAlertAsync(Alert alert)
    {
        if (!_isConfigured || _database == null)
        {
            throw new InvalidOperationException("Cosmos DB not configured");
        }

        var container = _database.GetContainer("Alerts");
        var response = await container.CreateItemAsync(alert, new PartitionKey(alert.DeviceId));
        return response.Resource;
    }

    public async Task<bool> MarkAlertAsReadAsync(string alertId)
    {
        if (!_isConfigured)
        {
            return false;
        }

        // Implementation for Cosmos DB
        await Task.CompletedTask;
        return true;
    }

    public async Task<bool> ResolveAlertAsync(string alertId)
    {
        if (!_isConfigured)
        {
            return false;
        }

        await Task.CompletedTask;
        return true;
    }

    // New methods for NeuraLens behavioral analytics
    public async Task<BehavioralFeatures> SaveBehavioralFeaturesAsync(BehavioralFeatures features)
    {
        if (!_isConfigured || _database == null)
        {
            throw new InvalidOperationException("Cosmos DB not configured");
        }

        var container = _database.GetContainer("BehavioralFeatures");
        var response = await container.CreateItemAsync(features, new PartitionKey(features.SessionId));
        return response.Resource;
    }

    public async Task<List<BehavioralFeatures>> GetBehavioralFeaturesBySessionAsync(string sessionId)
    {
        if (!_isConfigured || _database == null)
        {
            return new List<BehavioralFeatures>();
        }

        try
        {
            var container = _database.GetContainer("BehavioralFeatures");
            var query = new QueryDefinition("SELECT * FROM c WHERE c.sessionId = @sessionId ORDER BY c.timestamp DESC")
                .WithParameter("@sessionId", sessionId);

            var results = new List<BehavioralFeatures>();
            var iterator = container.GetItemQueryIterator<BehavioralFeatures>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching behavioral features for session {SessionId}", sessionId);
            return new List<BehavioralFeatures>();
        }
    }

    public async Task<List<BehavioralFeatures>> GetBehavioralFeaturesByStudentAsync(string studentId, DateTime startDate, DateTime endDate)
    {
        if (!_isConfigured || _database == null)
        {
            return new List<BehavioralFeatures>();
        }

        try
        {
            var container = _database.GetContainer("BehavioralFeatures");
            var query = new QueryDefinition("SELECT * FROM c WHERE c.studentId = @studentId AND c.timestamp >= @startDate AND c.timestamp <= @endDate ORDER BY c.timestamp DESC")
                .WithParameter("@studentId", studentId)
                .WithParameter("@startDate", startDate)
                .WithParameter("@endDate", endDate);

            var results = new List<BehavioralFeatures>();
            var iterator = container.GetItemQueryIterator<BehavioralFeatures>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching behavioral features for student {StudentId}", studentId);
            return new List<BehavioralFeatures>();
        }
    }

    public async Task<List<BehavioralFeatures>> GetBehavioralFeaturesByClassroomAsync(string classroomId, string timeWindow)
    {
        if (!_isConfigured || _database == null)
        {
            return new List<BehavioralFeatures>();
        }

        try
        {
            var container = _database.GetContainer("BehavioralFeatures");
            // Extract classroom from sessionId (assuming format: classroom-session)
            var query = new QueryDefinition("SELECT * FROM c WHERE STARTSWITH(c.sessionId, @classroomId) ORDER BY c.timestamp DESC")
                .WithParameter("@classroomId", classroomId);

            var results = new List<BehavioralFeatures>();
            var iterator = container.GetItemQueryIterator<BehavioralFeatures>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching behavioral features for classroom {ClassroomId}", classroomId);
            return new List<BehavioralFeatures>();
        }
    }
}
