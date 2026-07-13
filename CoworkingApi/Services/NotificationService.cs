using CoworkingApi.Data;
using CoworkingApi.Models;

namespace CoworkingApi.Services;

public interface INotificationService
{
    Task SendAsync(int userId, string title, string message, string type = "info");
    Task SendToOwnerOfCoworkingAsync(int coworkingId, string title, string message, string type = "info");
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    public NotificationService(AppDbContext db) => _db = db;

    public async Task SendAsync(int userId, string title, string message, string type = "info")
    {
        _db.Notifications.Add(new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type
        });
        await _db.SaveChangesAsync();
    }

    public async Task SendToOwnerOfCoworkingAsync(
        int coworkingId, string title, string message, string type = "info")
    {
        // Знаходимо OrganizationId коворкінгу
        var coworking = await _db.Coworkings.FindAsync(coworkingId);
        if (coworking?.OrganizationId == null) return;

        // Знаходимо власника цієї організації
        var owner = _db.Users.FirstOrDefault(u =>
            u.OrganizationId == coworking.OrganizationId &&
            u.Role == "owner");
        if (owner == null) return;

        await SendAsync(owner.Id, title, message, type);
    }
}