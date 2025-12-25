// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Modified for NeuraLens - ADHD/ASD Early Detection System

using ChatApp.WebApi.Models;

namespace ChatApp.WebApi.Services;

/// <summary>
/// Rule-based risk scoring engine for behavioral analysis
/// </summary>
public interface IRiskScoringEngine
{
    RiskAssessment CalculateRiskAssessment(BehavioralFeatures features, string sessionId, ClassroomBaseline? baseline = null);
    string DetermineRiskLevel(double riskScore);
}

public class RiskScoringEngine : IRiskScoringEngine
{
    private readonly ILogger<RiskScoringEngine> _logger;

    // Thresholds from configuration
    private const double MovementThreshold = 0.70;
    private const double AttentionThreshold = 0.60;

    public RiskScoringEngine(ILogger<RiskScoringEngine> logger)
    {
        _logger = logger;
    }

    public RiskAssessment CalculateRiskAssessment(
        BehavioralFeatures features,
        string sessionId,
        ClassroomBaseline? baseline = null)
    {
        _logger.LogInformation("Calculating risk assessment for student {StudentId} in session {SessionId}",
            features.StudentId, sessionId);

        // Extract scores
        var movementScore = features.MovementIntensity.MovementIntensityScore;
        var attentionScore = features.AttentionDuration.AttentionRatio;

        // Calculate overall risk score (weighted average)
        // Movement: 40%, Attention: 60% (attention is more critical for ADHD/ASD)
        var riskScore = CalculateOverallRiskScore(movementScore, attentionScore);

        // Determine risk level
        var riskLevel = DetermineRiskLevel(riskScore);

        // Create indicator details
        var movementIndicator = new IndicatorDetail
        {
            Value = movementScore,
            Status = features.MovementIntensity.Status,
            Confidence = CalculateConfidence(movementScore, MovementThreshold)
        };

        var attentionIndicator = new IndicatorDetail
        {
            Value = attentionScore,
            Status = features.AttentionDuration.Status,
            Confidence = CalculateConfidence(1 - attentionScore, AttentionThreshold) // Invert for attention
        };

        var indicators = new RiskIndicators
        {
            MovementIntensity = movementIndicator,
            AttentionDuration = attentionIndicator
        };

        var assessment = new RiskAssessment
        {
            StudentId = features.StudentId,
            Timestamp = features.Timestamp,
            SessionId = sessionId,
            OverallRisk = riskLevel,
            RiskScore = riskScore,
            Indicators = indicators
        };

        _logger.LogInformation("Risk assessment completed. StudentId: {StudentId}, RiskLevel: {RiskLevel}, RiskScore: {RiskScore:F2}",
            features.StudentId, riskLevel, riskScore);

        return assessment;
    }

    public string DetermineRiskLevel(double riskScore)
    {
        return riskScore switch
        {
            >= 0.70 => "HIGH",
            >= 0.50 => "MEDIUM",
            _ => "LOW"
        };
    }

    private double CalculateOverallRiskScore(double movementScore, double attentionScore)
    {
        // Movement contributes to risk when HIGH
        // Attention contributes to risk when LOW (so we invert it)
        var movementRisk = Math.Max(0, movementScore - MovementThreshold) / (1 - MovementThreshold);
        var attentionRisk = Math.Max(0, AttentionThreshold - attentionScore) / AttentionThreshold;

        // Weighted combination: 40% movement, 60% attention
        var overallRisk = (movementRisk * 0.4) + (attentionRisk * 0.6);

        // Normalize to 0-1 scale
        return Math.Clamp(overallRisk, 0.0, 1.0);
    }

    private double CalculateConfidence(double value, double threshold)
    {
        // Confidence is higher when value is further from threshold
        var deviation = Math.Abs(value - threshold);
        var confidence = Math.Min(0.5 + (deviation * 2), 1.0);
        return Math.Round(confidence, 2);
    }
}
