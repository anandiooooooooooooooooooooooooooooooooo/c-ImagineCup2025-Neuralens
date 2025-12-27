using System.Net.Http.Json;
using System.Text.Json;
using NeuraLens.Api.Models;

namespace NeuraLens.Api.Services;

public interface IComputerVisionService
{
    Task<VideoProcessingResponse> ProcessVideoAsync(string videoUrl, string sessionId, string anonymizationMethod = "blur");
    Task<string> GetProcessingStatusAsync(string sessionId);
}

public class ComputerVisionService : IComputerVisionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ComputerVisionService> _logger;
    private readonly IConfiguration _configuration;

    public ComputerVisionService(HttpClient httpClient, ILogger<ComputerVisionService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;

        // Configure HTTP client for CV Engine
        var cvEngineUrl = _configuration["ComputerVision:BaseUrl"] ?? "http://localhost:8000";
        _httpClient.BaseAddress = new Uri(cvEngineUrl);
        _httpClient.Timeout = TimeSpan.FromMinutes(30); // Long timeout for video processing
    }

    public async Task<VideoProcessingResponse> ProcessVideoAsync(string videoUrl, string sessionId, string anonymizationMethod = "blur")
    {
        try
        {
            _logger.LogInformation("Starting video processing for session {SessionId}", sessionId);

            // Prepare multipart form data
            using var content = new MultipartFormDataContent();
            content.Add(new StringContent(videoUrl), "video_url");
            content.Add(new StringContent(sessionId), "session_id");
            content.Add(new StringContent(anonymizationMethod), "anonymization_method");

            var response = await _httpClient.PostAsync("/process-video", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("CV Engine returned error: {StatusCode} - {Error}", response.StatusCode, errorContent);
                throw new HttpRequestException($"CV Engine error: {response.StatusCode}");
            }

            var result = await response.Content.ReadFromJsonAsync<VideoProcessingResponse>();
            if (result == null)
            {
                throw new InvalidOperationException("Invalid response from CV Engine");
            }

            _logger.LogInformation("Video processing completed for session {SessionId}", sessionId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing video for session {SessionId}", sessionId);
            throw;
        }
    }

    public async Task<string> GetProcessingStatusAsync(string sessionId)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/processing-status/{sessionId}");

            if (!response.IsSuccessStatusCode)
            {
                return "unknown";
            }

            var statusResponse = await response.Content.ReadFromJsonAsync<JsonElement>();
            return statusResponse.GetProperty("status").GetString() ?? "unknown";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting processing status for session {SessionId}", sessionId);
            return "error";
        }
    }
}