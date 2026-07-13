using CoworkingApi.Data;
using CoworkingApi.DTOs;
using CoworkingApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CoworkingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReviewsController(AppDbContext db) => _db = db;

    private int GetUserId() => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub") ?? "0");

    // GET: api/reviews/coworking/{id}
    [HttpGet("coworking/{coworkingId}")]
    public async Task<IActionResult> GetByCoworking(int coworkingId)
    {
        // 1. Спочатку завантажуємо дані з бази в оперативну пам'ять
        // Include підтягне користувача, і EF Core ПРАВИЛЬНО розшифрує FirstName/LastName
        var reviews = await _db.Reviews
            .Where(r => r.CoworkingId == coworkingId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        // 2. Форматуємо результат (LINQ to Objects) вже з розшифрованими даними
        var result = reviews.Select(r => new
        {
            r.Id,
            r.Rating,
            r.Comment,
            r.CreatedAt,
            r.UserId,
            Author = $"{r.User?.FirstName} {r.User?.LastName}".Trim()
        });

        return Ok(result);
    }

    // POST: api/reviews
    [HttpPost]
    [Authorize(Roles = "client")]
    public async Task<IActionResult> Create([FromBody] ReviewCreateDto dto)
    {
        var userId = GetUserId();

        // Перевірка: чи є вже відгук від цього користувача
        var existing = await _db.Reviews
            .FirstOrDefaultAsync(r =>
                r.CoworkingId == dto.CoworkingId &&
                r.UserId == userId);

        if (existing != null)
            return BadRequest(new
            {
                message = "Ви вже залишили відгук для цього коворкінгу. " +
                          "Відредагуйте або видаліть існуючий."
            });

        // Перевірка: чи є підтверджене бронювання
        var hasBooking = await _db.Bookings.AnyAsync(b =>
            b.UserId == userId &&
            b.CoworkingId == dto.CoworkingId &&
            b.Status == "confirmed");

        if (!hasBooking)
            return BadRequest(new
            {
                message = "Відгук можна залишити лише після підтвердженого бронювання"
            });

        var review = new Review
        {
            CoworkingId = dto.CoworkingId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment
        };

        _db.Reviews.Add(review);
        await UpdateRating(dto.CoworkingId);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        return Ok(new
        {
            review.Id,
            review.Rating,
            review.Comment,
            review.CreatedAt,
            review.UserId,
            Author = $"{user?.FirstName} {user?.LastName}".Trim()
        });
    }

    // PUT: api/reviews/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "client")]
    public async Task<IActionResult> Update(int id, [FromBody] ReviewCreateDto dto)
    {
        var userId = GetUserId();
        var review = await _db.Reviews
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return NotFound();
        if (review.UserId != userId) return Forbid();

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;

        await UpdateRating(review.CoworkingId);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            review.Id,
            review.Rating,
            review.Comment,
            review.CreatedAt,
            review.UserId,
            Author = $"{review.User?.FirstName} {review.User?.LastName}".Trim()
        });
    }

    // DELETE: api/reviews/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var userRole = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var review = await _db.Reviews.FindAsync(id);
        if (review == null) return NotFound();
        if (review.UserId != userId && userRole != "admin") return Forbid();

        var coworkingId = review.CoworkingId;
        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
        await UpdateRating(coworkingId);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Допоміжний метод перерахунку рейтингу
    private async Task UpdateRating(int coworkingId)
    {
        var coworking = await _db.Coworkings.FindAsync(coworkingId);
        if (coworking == null) return;

        var reviews = await _db.Reviews
            .Where(r => r.CoworkingId == coworkingId)
            .ToListAsync();

        coworking.Rating = reviews.Any()
            ? Math.Round(reviews.Average(r => (double)r.Rating), 1)
            : 0;
    }
}