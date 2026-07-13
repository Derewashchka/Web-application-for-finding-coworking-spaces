using System.Net;
using System.Text.Json;

namespace CoworkingApi.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = ex switch
        {
            UnauthorizedAccessException =>
                (HttpStatusCode.Unauthorized, "Доступ заборонено"),

            KeyNotFoundException =>
                (HttpStatusCode.NotFound, "Ресурс не знайдено"),

            ArgumentException e =>
                (HttpStatusCode.BadRequest, e.Message),

            _ => (HttpStatusCode.InternalServerError,
                  "Внутрішня помилка сервера. Спробуйте пізніше.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            statusCode = (int)statusCode,
            message,
            // Детальний стектрейс тільки в режимі розробки
            detail = _env.IsDevelopment() ? ex.ToString() : null
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}