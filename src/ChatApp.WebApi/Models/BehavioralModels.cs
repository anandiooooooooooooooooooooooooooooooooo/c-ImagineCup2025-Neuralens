// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Modified for NeuraLens - ADHD/ASD Early Detection System

namespace ChatApp.WebApi.Models;

/// <summary>
/// Behavioral features extracted from video analysis
/// </summary>
public record BehavioralFeatures
{
    public required string StudentId { get; init; }
    public required MovementIntensityData MovementIntensity { get; init; }
    public required AttentionDurationData AttentionDuration { get; init; }
    public required string Timestamp { get; init; }
}

/// <summary>
/// Movement Intensity Index (MII) data
/// </summary>
public record MovementIntensityData
{
    public required double MovementIntensityScore { get; init; }
    public required double Threshold { get; init; }
    public required string Status { get; init; }
    public required int EventCount { get; init; }
    public required string TimeWindow { get; init; }
    public double? BaselineDeviation { get; init; }
}

/// <summary>
/// Attention Duration Ratio (ADR) data
/// </summary>
public record AttentionDurationData
{
    public required double AttentionRatio { get; init; }
    public required double Threshold { get; init; }
    public required string Status { get; init; }
    public required string LongestFocusDuration { get; init; }
    public required string AverageFocusDuration { get; init; }
    public required string TimeWindow { get; init; }
    public double? BaselineDeviation { get; init; }
}

/// <summary>
/// Risk assessment for a student
/// </summary>
public record RiskAssessment
{
    public required string StudentId { get; init; }
    public required string Timestamp { get; init; }
    public required string SessionId { get; init; }
    public required string OverallRisk { get; init; } // LOW, MEDIUM, HIGH
    public required double RiskScore { get; init; } // 0-1 scale
    public required RiskIndicators Indicators { get; init; }
    public string? Explanation { get; init; }
    public List<string>? Recommendations { get; init; }
}

public record RiskIndicators
{
    public required IndicatorDetail MovementIntensity { get; init; }
    public required IndicatorDetail AttentionDuration { get; init; }
}

public record IndicatorDetail
{
    public required double Value { get; init; }
    public required string Status { get; init; }
    public required double Confidence { get; init; }
}

/// <summary>
/// Classroom baseline metrics
/// </summary>
public record ClassroomBaseline
{
    public required string SessionId { get; init; }
    public required string CalculatedAt { get; init; }
    public required int StudentCount { get; init; }
    public required double AverageMovement { get; init; }
    public required double AverageAttention { get; init; }
    public required double MovementStdDev { get; init; }
    public required double AttentionStdDev { get; init; }
}

/// <summary>
/// Dashboard statistics
/// </summary>
public record DashboardStats
{
    public required int TotalSessions { get; init; }
    public required int TotalStudentsMonitored { get; init; }
    public required int HighRiskCount { get; init; }
    public required int MediumRiskCount { get; init; }
    public required int LowRiskCount { get; init; }
    public required double AverageClassroomAttention { get; init; }
    public required double AverageClassroomMovement { get; init; }
}

/// <summary>
/// Video processing request
/// </summary>
public record VideoProcessingRequest
{
    public required string SessionId { get; init; }
    public required string ClassName { get; init; }
    public required string ActivityType { get; init; }
}

/// <summary>
/// Video processing status
/// </summary>
public record VideoProcessingStatus
{
    public required string SessionId { get; init; }
    public required string Status { get; init; } // queued, processing, completed, failed
    public required double Progress { get; init; } // 0-100
    public required string Message { get; init; }
    public int? EstimatedTimeRemaining { get; init; } // in seconds
}

/// <summary>
/// CV Engine response from Python service
/// </summary>
public record CVEngineResponse
{
    public required string SessionId { get; init; }
    public required List<BehavioralFeatures> Students { get; init; }
    public required double ProcessingTime { get; init; }
    public required int FramesProcessed { get; init; }
    public required Dictionary<string, object> AnonymizationStats { get; init; }
}
