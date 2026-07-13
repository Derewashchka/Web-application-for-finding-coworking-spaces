using CoworkingApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CoworkingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "owner")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StatsController(AppDbContext db) => _db = db;

    private async Task<List<int>> GetOwnerCoworkingIds()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (!int.TryParse(userIdStr, out var userId)) return new();

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return new();

        return await _db.Coworkings
            .Where(c => c.OrganizationId == user.OrganizationId)
            .Select(c => c.Id)
            .ToListAsync();
    }

    // GET: api/stats/overview
    [HttpGet("overview")]
    public async Task<IActionResult> Overview()
    {
        var ids = await GetOwnerCoworkingIds();

        var totalBookings = await _db.Bookings
            .CountAsync(b => ids.Contains(b.CoworkingId));

        var confirmedBookings = await _db.Bookings
            .CountAsync(b => ids.Contains(b.CoworkingId) &&
                             b.Status == "confirmed");

        var totalRevenue = await _db.Bookings
            .Where(b => ids.Contains(b.CoworkingId) &&
                        b.Status == "confirmed")
            .SumAsync(b => b.TotalPrice);

        var avgRating = await _db.Coworkings
            .Where(c => ids.Contains(c.Id) && c.Rating > 0)
            .AverageAsync(c => (double?)c.Rating) ?? 0;

        var totalReviews = await _db.Reviews
            .CountAsync(r => ids.Contains(r.CoworkingId));

        return Ok(new
        {
            totalBookings,
            confirmedBookings,
            totalRevenue,
            avgRating = Math.Round(avgRating, 1),
            totalReviews,
            coworkingsCount = ids.Count
        });
    }

    // GET: api/stats/revenue-by-month
    [HttpGet("revenue-by-month")]
    public async Task<IActionResult> RevenueByMonth()
    {
        var ids = await GetOwnerCoworkingIds();
        var from = DateTime.UtcNow.AddMonths(-11);

        var bookings = await _db.Bookings
            .Where(b => ids.Contains(b.CoworkingId) &&
                        b.Status == "confirmed" &&
                        b.DateFrom >= from)
            .ToListAsync();

        var result = bookings
            .GroupBy(b => new { b.DateFrom.Year, b.DateFrom.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new
            {
                month = $"{g.Key.Year}-{g.Key.Month:D2}",
                revenue = g.Sum(b => b.TotalPrice),
                count = g.Count()
            })
            .ToList();

        return Ok(result);
    }

    // GET: api/stats/bookings-by-weekday
    [HttpGet("bookings-by-weekday")]
    public async Task<IActionResult> BookingsByWeekday()
    {
        var ids = await GetOwnerCoworkingIds();

        var bookings = await _db.Bookings
            .Where(b => ids.Contains(b.CoworkingId) &&
                        b.Status != "cancelled")
            .ToListAsync();

        var days = new[] { "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд" };

        var result = bookings
            .GroupBy(b => ((int)b.DateFrom.DayOfWeek + 6) % 7)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                day = days[g.Key],
                count = g.Count()
            })
            .ToList();

        // Заповнюємо відсутні дні нулями
        var full = days.Select((d, i) => new
        {
            day = d,
            count = result.FirstOrDefault(r => r.day == d)?.count ?? 0
        });

        return Ok(full);
    }

    // GET: api/stats/popular-hours
    [HttpGet("popular-hours")]
    public async Task<IActionResult> PopularHours()
    {
        var ids = await GetOwnerCoworkingIds();

        var bookings = await _db.Bookings
            .Where(b => ids.Contains(b.CoworkingId) &&
                        b.Status != "cancelled")
            .ToListAsync();

        var result = bookings
            .GroupBy(b => b.DateFrom.Hour)
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                hour = $"{g.Key:D2}:00",
                count = g.Count()
            })
            .ToList();

        return Ok(result);
    }
}