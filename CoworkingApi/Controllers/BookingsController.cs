using CoworkingApi.Data;
using CoworkingApi.DTOs;
using CoworkingApi.Models;
using CoworkingApi.Services; // Додайте простір імен, де знаходиться INotificationService та IAuditService
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CoworkingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notify;
    private readonly IAuditService _audit;

    public BookingsController(
        AppDbContext db,
        INotificationService notify,
        IAuditService audit)
    {
        _db = db;
        _notify = notify;
        _audit = audit;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? "0");

    // GET: api/bookings/my
    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var userId = GetUserId();
        var bookings = await _db.Bookings
            .Where(b => b.UserId == userId)
            .Include(b => b.Coworking)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.DateFrom,
                b.DateTo,
                b.Status,
                b.TotalPrice,
                b.CreatedAt,
                Coworking = new
                {
                    b.Coworking.Id,
                    b.Coworking.Name,
                    b.Coworking.City
                }
            })
            .ToListAsync();

        return Ok(bookings);
    }

    // GET: api/bookings/all  (owner/admin)
    [HttpGet("all")]
    [Authorize(Roles = "owner,admin")]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await _db.Bookings
            .Include(b => b.Coworking)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.DateFrom,
                b.DateTo,
                b.Status,
                b.TotalPrice,
                b.CreatedAt,
                Coworking = new { b.Coworking.Id, b.Coworking.Name, b.Coworking.City },
                User = new { b.User.Id, b.User.FirstName, b.User.LastName, b.User.Email }
            })
            .ToListAsync();

        return Ok(bookings);
    }

    // GET: api/bookings/availability
    [HttpGet("availability")]
    public async Task<IActionResult> CheckAvailability(
    [FromQuery] int coworkingId,
    [FromQuery] DateTime dateFrom,
    [FromQuery] DateTime dateTo)
    {
        var coworking = await _db.Coworkings.FindAsync(coworkingId);
        if (coworking == null)
            return NotFound(new { message = "Коворкінг не знайдено" });

        var overlappingCount = await _db.Bookings.CountAsync(b =>
            b.CoworkingId == coworkingId &&
            b.Status != "cancelled" &&
            b.DateFrom < dateTo &&
            b.DateTo > dateFrom);

        var available = coworking.TotalSeats - overlappingCount;

        var userAlreadyBooked = false;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        if (int.TryParse(userIdStr, out var userId))
        {
            userAlreadyBooked = await _db.Bookings.AnyAsync(b =>
                b.CoworkingId == coworkingId &&
                b.UserId == userId &&
                b.Status != "cancelled" &&
                b.DateFrom < dateTo &&
                b.DateTo > dateFrom);
        }

        return Ok(new
        {
            totalSeats = coworking.TotalSeats,
            bookedSeats = overlappingCount,
            availableSeats = Math.Max(0, available),
            isAvailable = available > 0 && !userAlreadyBooked,
            userAlreadyBooked,
        });
    }

    // POST: api/bookings
    [HttpPost]
    [Authorize(Roles = "client")]
    public async Task<IActionResult> Create([FromBody] BookingCreateDto dto)
    {
        var userId = GetUserId();
        if (userId == 0) return Unauthorized();

        var coworking = await _db.Coworkings.FindAsync(dto.CoworkingId);
        if (coworking == null)
            return NotFound(new { message = "Коворкінг не знайдено" });

        if (!coworking.IsApproved)
            return BadRequest(new { message = "Коворкінг ще не затверджений" });

        if (dto.DateTo <= dto.DateFrom)
            return BadRequest(new { message = "Некоректний час бронювання" });

        // ── Перевірка робочих годин ──
        var fromHour = dto.DateFrom.Hour;
        var toHour = dto.DateTo.Hour;
        var toMinute = dto.DateTo.Minute;

        if (fromHour < 8 || fromHour > 22)
            return BadRequest(new
            {
                message = "Бронювання доступне лише з 08:00 до 23:00"
            });

        // 23:00 — останній дозволений час кінця (23:00 рівно, не пізніше)
        if (toHour > 23 || (toHour == 23 && toMinute > 0))
            return BadRequest(new
            {
                message = "Час завершення не може бути пізніше 23:00"
            });

        var userAlreadyBooked = await _db.Bookings.AnyAsync(b =>
            b.CoworkingId == dto.CoworkingId &&
            b.UserId == userId &&
            b.Status != "cancelled" &&
            b.DateFrom < dto.DateTo &&
            b.DateTo > dto.DateFrom);

        if (userAlreadyBooked)
            return BadRequest(new
            {
                message = "Ви вже маєте активне бронювання в цьому " +
                          "коворкінгу на обраний час."
            });

        var overlappingCount = await _db.Bookings.CountAsync(b =>
            b.CoworkingId == dto.CoworkingId &&
            b.Status != "cancelled" &&
            b.DateFrom < dto.DateTo &&
            b.DateTo > dto.DateFrom);

        if (overlappingCount >= coworking.TotalSeats)
            return BadRequest(new
            {
                message = $"На обраний час всі місця зайняті " +
                          $"({coworking.TotalSeats} з {coworking.TotalSeats}). " +
                          $"Спробуйте інший час."
            });

        var hours = (decimal)(dto.DateTo - dto.DateFrom).TotalHours;

        var booking = new Booking
        {
            CoworkingId = dto.CoworkingId,
            UserId = userId,
            DateFrom = dto.DateFrom,
            DateTo = dto.DateTo,
            TotalPrice = Math.Round(hours * coworking.PricePerHour, 2),
            Status = "pending"
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        // ── Логування ──
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _audit.LogAsync("BOOKING_CREATED", "Booking",
            entityId: booking.Id.ToString(),
            details: $"Коворкінг: {coworking.Name}, " +
                      $"{booking.DateFrom:dd.MM.yyyy HH:mm}–{booking.DateTo:HH:mm}",
            userId: userId,
            userEmail: User.FindFirstValue(ClaimTypes.Email),
            ip: ip);

        // Сповіщення клієнту
        await _notify.SendAsync(
            userId,
            "Бронювання створено",
            $"Ваше бронювання в «{coworking.Name}» на " +
            $"{booking.DateFrom:dd.MM.yyyy HH:mm} очікує підтвердження.",
            "info");

        // Сповіщення власнику
        await _notify.SendToOwnerOfCoworkingAsync(
            dto.CoworkingId,
            "Нове бронювання",
            $"Новий клієнт забронював місце в «{coworking.Name}» на " +
            $"{booking.DateFrom:dd.MM.yyyy HH:mm}.",
            "info");

        return Ok(new
        {
            booking.Id,
            booking.Status,
            booking.TotalPrice,
            message = $"Місце заброньовано! " +
                      $"Зайнято {overlappingCount + 1} з {coworking.TotalSeats} місць."
        });
    }

    // PATCH: api/bookings/{id}/cancel
    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = GetUserId();
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();
        if (booking.UserId != userId) return Forbid();

        booking.Status = "cancelled";
        await _db.SaveChangesAsync();

        // ── Логування ──
        await _audit.LogAsync("BOOKING_CANCELLED", "Booking",
            entityId: id.ToString(),
            details: $"Скасовано бронювання #{id}",
            userId: userId,
            userEmail: User.FindFirstValue(ClaimTypes.Email),
            ip: HttpContext.Connection.RemoteIpAddress?.ToString());

        var fullBooking = await _db.Bookings
            .Include(b => b.Coworking)
            .FirstAsync(b => b.Id == id);

        await _notify.SendAsync(
            fullBooking.UserId,
            "Бронювання скасовано",
            $"Бронювання в «{fullBooking.Coworking.Name}» на " +
            $"{fullBooking.DateFrom:dd.MM.yyyy HH:mm} скасовано.",
            "warning");

        return NoContent();
    }

    // PATCH: api/bookings/{id}/confirm  (owner/admin)
    [HttpPatch("{id}/confirm")]
    [Authorize(Roles = "owner,admin")]
    public async Task<IActionResult> Confirm(int id)
    {
        var booking = await _db.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        booking.Status = "confirmed";
        await _db.SaveChangesAsync();

        // ── Логування ──
        await _audit.LogAsync("BOOKING_CONFIRMED", "Booking",
            entityId: id.ToString(),
            details: $"Підтверджено бронювання #{id}",
            userId: GetUserId(),
            userEmail: User.FindFirstValue(ClaimTypes.Email),
            ip: HttpContext.Connection.RemoteIpAddress?.ToString());

        var confirmedBooking = await _db.Bookings
            .Include(b => b.Coworking)
            .FirstAsync(b => b.Id == id);

        await _notify.SendAsync(
            confirmedBooking.UserId,
            "Бронювання підтверджено ✓",
            $"Ваше бронювання в «{confirmedBooking.Coworking.Name}» на " +
            $"{confirmedBooking.DateFrom:dd.MM.yyyy HH:mm} підтверджено!",
            "success");

        return NoContent();
    }

    // GET: api/bookings/busy-days
    [HttpGet("busy-days")]
    public async Task<IActionResult> GetBusyDays(
        [FromQuery] int coworkingId,
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var coworking = await _db.Coworkings.FindAsync(coworkingId);
        if (coworking == null) return NotFound();

        var bookings = await _db.Bookings
            .Where(b =>
                b.CoworkingId == coworkingId &&
                b.Status != "cancelled" &&
                b.DateFrom < to &&
                b.DateTo > from)
            .ToListAsync();

        // Рахуємо скільки бронювань на кожен день
        var busyDays = new Dictionary<string, int>();

        foreach (var booking in bookings)
        {
            var day = booking.DateFrom.Date;
            while (day < booking.DateTo.Date.AddDays(1) && day <= to.Date)
            {
                var key = day.ToString("yyyy-MM-dd");
                busyDays[key] = busyDays.GetValueOrDefault(key) + 1;
                day = day.AddDays(1);
            }
        }

        return Ok(busyDays);
    }

    // GET: api/bookings/day-slots
    [HttpGet("day-slots")]
    public async Task<IActionResult> GetDaySlots(
        [FromQuery] int coworkingId,
        [FromQuery] DateTime date)
    {
        var coworking = await _db.Coworkings.FindAsync(coworkingId);
        if (coworking == null) return NotFound();

        var dayStart = date.Date;
        var dayEnd = dayStart.AddDays(1);

        var bookings = await _db.Bookings
            .Where(b =>
                b.CoworkingId == coworkingId &&
                b.Status != "cancelled" &&
                b.DateFrom < dayEnd &&
                b.DateTo > dayStart)
            .ToListAsync();

        // Для кожної години 8-20 рахуємо кількість бронювань
        var slots = Enumerable.Range(8, 13).Select(hour =>
        {
            var slotStart = dayStart.AddHours(hour);
            var slotEnd = slotStart.AddHours(1);

            var booked = bookings.Count(b =>
                b.DateFrom < slotEnd && b.DateTo > slotStart);

            return new
            {
                hour,
                booked,
                total = coworking.TotalSeats,
                free = Math.Max(0, coworking.TotalSeats - booked)
            };
        }).ToList();

        return Ok(slots);
    }

    // GET: api/bookings/my-coworkings  (owner)
    [HttpGet("my-coworkings")]
    [Authorize(Roles = "owner")]
    public async Task<IActionResult> GetMyCoworkingsBookings()
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user?.OrganizationId == null) return Ok(new List<object>());

        var coworkingIds = await _db.Coworkings
            .Where(c => c.OrganizationId == user.OrganizationId)
            .Select(c => c.Id)
            .ToListAsync();

        var bookings = await _db.Bookings
            .Where(b => coworkingIds.Contains(b.CoworkingId))
            .Include(b => b.Coworking)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id,
                b.DateFrom,
                b.DateTo,
                b.Status,
                b.TotalPrice,
                b.CreatedAt,
                Coworking = new { b.Coworking.Id, b.Coworking.Name, b.Coworking.City },
                User = new
                {
                    b.User.Id,
                    b.User.FirstName,
                    b.User.LastName,
                    b.User.Email,
                    b.User.Phone
                }
            })
            .ToListAsync();

        return Ok(bookings);
    }
}