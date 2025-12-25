// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Modified for NeuraLens - ADHD/ASD Early Detection System

using ChatApp.WebApi.Models;
using System.Text.Json;

namespace ChatApp.WebApi.Services;

/// <summary>
/// Service for communicating with the Python Computer Vision Engine
/// </summary>
public interface IComputerVisionService
{
    Task<CVEngineResponse> ProcessVideoAsync(Stream videoStream, string sessionId, string fileName);
    Task<VideoProcessingStatus> GetProcessingStatusAsync(string sessionId);
    Task<bool> HealthCheckAsync();
}

public class ComputerVisionService : IComputerVisionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ComputerVisionService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public ComputerVisionService(
        HttpClient httpClient,
        ILogger<ComputerVisionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    public async Task<CVEngineResponse> ProcessVideoAsync(Stream videoStream, string sessionId, string fileName)
    {
        try
        {
            _logger.LogInformation("Sending video to CV engine for processing. SessionId: {SessionId}", sessionId);

            using var content = new MultipartFormDataContent();
            var streamContent = new StreamContent(videoStream);
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("video/mp4");
            
            content.Add(streamContent, "file", fileName);
            content.Add(new StringContent(sessionId), "session_id");

            var response = await _httpClient.PostAsync("/process-video", content);
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CVEngineResponse>(jsonResponse, _jsonOptions);

            if (result == null)
            {
                throw new InvalidOperationException("Failed to deserialize CV engine response");
            }

            _logger.LogInformation("CV engine processing completed. SessionId: {SessionId}, FramesProcessed: {FramesProcessed}", 
                sessionId, result.FramesProcessed);

            return result;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error communicating with CV engine. SessionId: {SessionId}", sessionId);
            throw new InvalidOperationException("Failed to communicate with CV engine", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing video with CV engine. SessionId: {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<VideoProcessingStatus> GetProcessingStatusAsync(string sessionId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/processing-status/{sessionId}");
            response.EnsureSuccessStatusCode();

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<VideoProcessingStatus>(jsonResponse, _jsonOptions);

            if (result == null)
            {
                throw new InvalidOperationException("Failed to deserialize processing status");
            }

            return result;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error getting processing status. SessionId: {SessionId}", sessionId);
            throw new InvalidOperationException("Failed to get processing status from CV engine", ex);
        }
    }

    public async Task<bool> HealthCheckAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/health");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "CV engine health check failed");
            return false;
        }
    }
}
