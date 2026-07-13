using CoworkingApi.Data;
using CoworkingApi.Models;

namespace CoworkingApi.Services;

public interface IAuditService
{
    Task LogAsync(
        string action,
        string entity,
        string? entityId = null,
        string? details = null,
        int? userId = null,
        string? userEmail = null,
        string? ip = null
    );
}

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    public AuditService(AppDbContext db) => _db = db;

    public async Task LogAsync(
        string action,
        string entity,
        string? entityId = null,
        string? details = null,
        int? userId = null,
        string? userEmail = null,
        string? ip = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            UserEmail = userEmail ?? "anonymous",
            Action = action,
            Entity = entity,
            EntityId = entityId,
            Details = details,
            IpAddress = ip
        });
        await _db.SaveChangesAsync();
    }
}