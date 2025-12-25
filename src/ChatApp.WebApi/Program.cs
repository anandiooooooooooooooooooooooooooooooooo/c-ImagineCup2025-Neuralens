// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Modified for NeuraLens - ADHD/ASD Early Detection System

using Azure.Identity;
using ChatApp.ServiceDefaults.Contracts;
using ChatApp.WebApi.Services;
using Microsoft.SemanticKernel;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Azure OpenAI for Explainable AI (XAI) - KEEP from boilerplate
builder.AddAzureOpenAIClient("openAi", configureSettings: settings =>
{
    settings.Credential = new DefaultAzureCredential(new DefaultAzureCredentialOptions { ExcludeVisualStudioCredential = true });
});

// Semantic Kernel for AI Agent Service (XAI generation) - KEEP from boilerplate
builder.Services.AddKernel()
    .AddAzureOpenAIChatCompletion(builder.Configuration["AzureDeployment"]!)
    .ConfigureOpenTelemetry(builder.Configuration);

// NeuraLens Services - NEW
builder.Services.AddHttpClient<IComputerVisionService, ComputerVisionService>(client =>
{
    var cvEngineUrl = builder.Configuration["CVEngine:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(cvEngineUrl);
    client.Timeout = TimeSpan.FromMinutes(5); // Long timeout for video processing
});

builder.Services.AddSingleton<IRiskScoringEngine, RiskScoringEngine>();

// TODO: Add Cosmos DB and Blob Storage when ready
// builder.AddAzureCosmosDB("neuralens-cosmosdb");
// builder.AddAzureBlobClient("neuralens-storage");

// Controllers with JSON options
builder.Services
    .AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter<AIChatRole>(JsonNamingPolicy.CamelCase)));

// CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin() // Allow all origins for development
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseCors();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();
