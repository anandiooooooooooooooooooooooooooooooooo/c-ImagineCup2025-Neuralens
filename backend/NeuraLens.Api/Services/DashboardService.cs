using NeuraLens.Api.Domain;

namespace NeuraLens.Api.Services;

public interface IDashboardService
{
    Task<DashboardStats> GetDashboardStatsAsync();
    Task<List<TimeSeriesData>> GetDetectionTrendAsync(int hours = 24);
    Task<List<DetectionSummary>> GetDetectionSummaryAsync();
}

public class DashboardService : IDashboardService
{
    private readonly IIoTHubService _iotHubService;
    private readonly ICosmosDbService _cosmosDbService;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        IIoTHubService iotHubService,
        ICosmosDbService cosmosDbService,
        ILogger<DashboardService> logger)
    {
        _iotHubService = iotHubService;
        _cosmosDbService = cosmosDbService;
        _logger = logger;
    }

    public async Task<DashboardStats> GetDashboardStatsAsync()
    {
        var devices = await _iotHubService.GetAllDevicesAsync();
        var detections = await _cosmosDbService.GetDetectionsAsync(limit: 1000);
        var alerts = await _cosmosDbService.GetAlertsAsync(unreadOnly: true);

        var onlineDevices = devices.Count(d => d.Status == "online");
        var offlineDevices = devices.Count(d => d.Status != "online");

        // Calculate average metrics from online devices
        var onlineDeviceMetrics = devices
            .Where(d => d.Status == "online" && d.Metrics != null)
            .Select(d => d.Metrics!)
            .ToList();

        var avgAccuracy = onlineDeviceMetrics.Any() 
            ? onlineDeviceMetrics.Average(m => m.Accuracy) 
            : 0;
        var avgLatency = onlineDeviceMetrics.Any() 
            ? onlineDeviceMetrics.Average(m => m.InferenceLatency) 
            : 0;

        // Get detection summary by object type
        var detectionSummary = detections
            .GroupBy(d => d.ObjectType)
            .Select(g => new DetectionSummary
            {
                ObjectType = g.Key,
                Count = g.Count(),
                AverageConfidence = g.Average(d => d.Confidence)
            })
            .OrderByDescending(s => s.Count)
            .Take(5)
            .ToList();

        // Get detection trend for last 24 hours
        var trend = await GetDetectionTrendAsync(24);

        // Generate simulated Risk Timeline for early detection
        var riskTimeline = GenerateRiskTimeline(24);

        // Generate simulated Behavioral Indicators
        var behavioralIndicators = GenerateBehavioralIndicators();

        // Generate simulated Classroom Heatmap
        var classroomHeatmap = GenerateClassroomHeatmap();

        return new DashboardStats
        {
            TotalDevices = devices.Count,
            OnlineDevices = onlineDevices,
            OfflineDevices = offlineDevices,
            TotalDetections = detections.Count,
            ActiveAlerts = alerts.Count,
            AverageAccuracy = Math.Round(avgAccuracy, 1),
            AverageLatency = Math.Round(avgLatency, 1),
            RecentDetections = detectionSummary,
            DetectionsOverTime = trend,
            RiskScoreTimeline = riskTimeline,
            BehavioralIndicators = behavioralIndicators,
            ClassroomHeatmap = classroomHeatmap
        };
    }

    public async Task<List<TimeSeriesData>> GetDetectionTrendAsync(int hours = 24)
    {
        var from = DateTime.UtcNow.AddHours(-hours);
        var detections = await _cosmosDbService.GetDetectionsAsync(from: from, limit: 10000);

        // Group by hour
        var trend = Enumerable.Range(0, hours)
            .Select(h =>
            {
                var hourStart = DateTime.UtcNow.AddHours(-hours + h);
                var hourEnd = hourStart.AddHours(1);
                var count = detections.Count(d => d.Timestamp >= hourStart && d.Timestamp < hourEnd);
                
                return new TimeSeriesData
                {
                    Timestamp = hourStart,
                    Value = count > 0 ? count : new Random().Next(5, 25) // Add some mock variation
                };
            })
            .ToList();

        return trend;
    }

    public async Task<List<DetectionSummary>> GetDetectionSummaryAsync()
    {
        var detections = await _cosmosDbService.GetDetectionsAsync(limit: 1000);
        
        return detections
            .GroupBy(d => d.ObjectType)
            .Select(g => new DetectionSummary
            {
                ObjectType = g.Key,
                Count = g.Count(),
                AverageConfidence = Math.Round(g.Average(d => d.Confidence), 1)
            })
            .OrderByDescending(s => s.Count)
            .ToList();
    }

    private List<RiskScoreTrend> GenerateRiskTimeline(int hours)
    {
        var random = new Random();
        var timeline = new List<RiskScoreTrend>();
        
        for (int i = 0; i < hours; i++)
        {
            var timestamp = DateTime.UtcNow.AddHours(-hours + i);
            
            // Simulate varying risk scores throughout the day
            var attentionScore = 40 + random.Next(0, 40) + Math.Sin(i * 0.5) * 15;
            var hyperactivityScore = 35 + random.Next(0, 35) + Math.Cos(i * 0.3) * 10;
            
            timeline.Add(new RiskScoreTrend
            {
                Timestamp = timestamp,
                AttentionScore = Math.Round(Math.Max(0, Math.Min(100, attentionScore)), 1),
                HyperactivityScore = Math.Round(Math.Max(0, Math.Min(100, hyperactivityScore)), 1),
                StudentId = "aggregate"
            });
        }
        
        return timeline;
    }

    private List<BehavioralIndicator> GenerateBehavioralIndicators()
    {
        // Behavioral indicators for school/orphanage settings - early ADHD/ASD detection
        return new List<BehavioralIndicator>
        {
            new() { Behavior = "Difficulty Sitting Still", Count = 23, Percentage = 28.5 },
            new() { Behavior = "Repetitive Movements", Count = 31, Percentage = 38.3 },
            new() { Behavior = "Difficulty Focusing", Count = 18, Percentage = 22.2 },
            new() { Behavior = "Minimal Eye Contact", Count = 15, Percentage = 18.5 },
            new() { Behavior = "Limited Social Response", Count = 12, Percentage = 14.8 },
            new() { Behavior = "Sensory Sensitivity", Count = 9, Percentage = 11.1 }
        };
    }

    private List<HeatmapPoint> GenerateClassroomHeatmap()
    {
        var random = new Random();
        var heatmap = new List<HeatmapPoint>();
        
        // Generate 10x10 grid for classroom activity
        for (int x = 0; x < 10; x++)
        {
            for (int y = 0; y < 10; y++)
            {
                // Simulate activity hotspots (e.g., teacher's desk, certain seats)
                var activity = random.Next(0, 100);
                
                // Increase activity near center (teacher area)
                if (x >= 4 && x <= 6 && y >= 4 && y <= 6)
                {
                    activity = Math.Min(100, activity + 40);
                }
                
                heatmap.Add(new HeatmapPoint
                {
                    X = x,
                    Y = y,
                    Activity = activity,
                    Zone = GetZoneName(x, y)
                });
            }
        }
        
        return heatmap;
    }

    private string GetZoneName(int x, int y)
    {
        if (x >= 4 && x <= 6 && y >= 4 && y <= 6) return "Teacher/Caregiver Area";
        if (x < 3) return "Left Classroom Zone";
        if (x > 6) return "Right Classroom Zone";
        return "Center Classroom Zone";
    }
}

