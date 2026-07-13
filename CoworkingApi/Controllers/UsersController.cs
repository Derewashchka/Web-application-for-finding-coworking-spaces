using CoworkingApi.Data;
using CoworkingApi.DTOs;
using CoworkingApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CoworkingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Допоміжний метод для отримання ID поточного користувача з JWT токена
    /// </summary>
    private int GetUserId() => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub") ?? "0");

    // GET: api/users/me
    [HttpGet("me")]
    [Authorize] // Доступно будь-якому авторизованому користувачу
    public async Task<IActionResult> GetMe()
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);

        if (user == null) return NotFound();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Phone,
            user.Role,
            user.OrganizationId
        });
    }

    // PUT: api/users/me
    [HttpPut("me")]
    [Authorize] // Доступно будь-якому авторизованому користувачу
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);

        if (user == null) return NotFound();

        // Логіка зміни пароля
        if (!string.IsNullOrEmpty(dto.NewPassword))
        {
            if (string.IsNullOrEmpty(dto.CurrentPassword))
                return BadRequest(new { message = "Введіть поточний пароль" });

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Поточний пароль невірний" });

            if (dto.NewPassword.Length < 6)
                return BadRequest(new { message = "Новий пароль має бути мінімум 6 символів" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        // Оновлення персональних даних
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Phone = dto.Phone;

        await _db.SaveChangesAsync();

        // ── Генеруємо новий токен з оновленими даними ──
        var authService = HttpContext.RequestServices
            .GetRequiredService<IAuthService>();

        var newToken = authService.GenerateTokenForUser(user);

        return Ok(new
        {
            token = newToken,
            user = new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Phone,
                user.Role
            }
        });
    }

    // GET: api/users
    [HttpGet]
    [Authorize(Roles = "admin")] // Тільки для адміністраторів
    public async Task<IActionResult> GetAll()
    {
        // EF Core автоматично розшифрує Email, FirstName, LastName, Phone завдяки конвертеру
        var users = await _db.Users.Select(u => new
        {
            u.Id,
            u.Email,
            u.FirstName,
            u.LastName,
            u.Role,
            u.Phone,
            u.CreatedAt
        }).ToListAsync();

        return Ok(users);
    }

    // GET: api/users/search?email=...
    [HttpGet("search")]
    [Authorize(Roles = "admin")] // Тільки для адміністраторів
    public async Task<IActionResult> GetByEmail([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { message = "Вкажіть email для пошуку" });

        var normalizedEmail = email.Trim().ToLower();

        // Шукаємо по звичайному email, EF Core сам зробить шифрування для WHERE
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null) return NotFound();

        return Ok(new
        {
            user.Id,
            user.Email, // EF Core автоматично розшифрує його при діставанні з бази
            user.FirstName,
            user.LastName,
            user.Role,
            user.Phone,
            user.CreatedAt
        });
    }

    // DELETE: api/users/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")] // Тільки для адміністраторів
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);

        if (user == null) return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}