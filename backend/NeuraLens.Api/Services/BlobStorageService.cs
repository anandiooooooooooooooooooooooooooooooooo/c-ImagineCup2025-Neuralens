using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace NeuraLens.Api.Services;

public interface IBlobStorageService
{
    Task<string> UploadImageAsync(string containerName, string blobName, Stream content, string contentType);
    Task<Stream?> DownloadImageAsync(string containerName, string blobName);
    Task<List<string>> ListBlobsAsync(string containerName, string? prefix = null);
    Task<bool> DeleteBlobAsync(string containerName, string blobName);
    string GetBlobUrl(string containerName, string blobName);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly ILogger<BlobStorageService> _logger;
    private readonly IConfiguration _configuration;
    private readonly BlobServiceClient? _blobServiceClient;
    private readonly bool _isConfigured;
    private readonly string _storageBaseUrl;

    public BlobStorageService(ILogger<BlobStorageService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        _storageBaseUrl = _configuration["Azure:BlobStorage:BaseUrl"] ?? "https://neuralens.blob.core.windows.net";

        var connectionString = _configuration["Azure:BlobStorage:ConnectionString"];
        if (!string.IsNullOrEmpty(connectionString) && connectionString != "YOUR_BLOB_STORAGE_CONNECTION_STRING")
        {
            try
            {
                _blobServiceClient = new BlobServiceClient(connectionString);
                _isConfigured = true;
                _logger.LogInformation("Azure Blob Storage service initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to initialize Azure Blob Storage");
                _isConfigured = false;
            }
        }
        else
        {
            _logger.LogInformation("Azure Blob Storage not configured, using mock URLs");
            _isConfigured = false;
        }
    }

    public async Task<string> UploadImageAsync(string containerName, string blobName, Stream content, string contentType)
    {
        if (!_isConfigured || _blobServiceClient == null)
        {
            _logger.LogInformation("Mock: Uploading blob {BlobName} to container {Container}", blobName, containerName);
            return GetBlobUrl(containerName, blobName);
        }

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobClient = containerClient.GetBlobClient(blobName);
            await blobClient.UploadAsync(content, new BlobHttpHeaders { ContentType = contentType });

            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading blob {BlobName}", blobName);
            throw;
        }
    }

    public async Task<Stream?> DownloadImageAsync(string containerName, string blobName)
    {
        if (!_isConfigured || _blobServiceClient == null)
        {
            _logger.LogInformation("Mock: Downloading blob {BlobName}", blobName);
            return null;
        }

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);
            
            var response = await blobClient.DownloadAsync();
            return response.Value.Content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading blob {BlobName}", blobName);
            return null;
        }
    }

    public async Task<List<string>> ListBlobsAsync(string containerName, string? prefix = null)
    {
        if (!_isConfigured || _blobServiceClient == null)
        {
            return new List<string>
            {
                "detection-001.jpg",
                "detection-002.jpg",
                "detection-003.jpg"
            };
        }

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobs = new List<string>();

            await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
            {
                blobs.Add(blobItem.Name);
            }

            return blobs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing blobs in container {Container}", containerName);
            return new List<string>();
        }
    }

    public async Task<bool> DeleteBlobAsync(string containerName, string blobName)
    {
        if (!_isConfigured || _blobServiceClient == null)
        {
            _logger.LogInformation("Mock: Deleting blob {BlobName}", blobName);
            return true;
        }

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);
            await blobClient.DeleteIfExistsAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting blob {BlobName}", blobName);
            return false;
        }
    }

    public string GetBlobUrl(string containerName, string blobName)
    {
        return $"{_storageBaseUrl}/{containerName}/{blobName}";
    }
}
