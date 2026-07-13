using CoworkingApi.Data;
using CoworkingApi.DTOs;
using CoworkingApi.Models;
using CoworkingApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CoworkingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoworkingsController : ControllerBase
{
    private readonly ICoworkingService _service;
    private readonly AppDbContext _db;

    public CoworkingsController(ICoworkingService service, AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    // GET: api/coworkings
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] CoworkingFilterDto filter,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9)
    {
        var query = _db.Coworkings
            .Where(c => c.IsApproved)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.City))
            query = query.Where(c => c.City.Contains(filter.City));
        if (filter.MinPrice.HasValue)
            query = query.Where(c => c.PricePerHour >= filter.MinPrice.Value);
        if (filter.MaxPrice.HasValue)
            query = query.Where(c => c.PricePerHour <= filter.MaxPrice.Value);
        if (filter.MinRating.HasValue)
            query = query.Where(c => c.Rating >= filter.MinRating.Value);
        if (!string.IsNullOrEmpty(filter.Amenity))
            query = query.Where(c =>
                c.Amenities != null && c.Amenities.Contains(filter.Amenity));

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.City,
                c.Address,
                c.PricePerHour,
                c.Rating,
                c.Description,
                c.PhotoUrl,
                c.Latitude,
                c.Longitude,
                c.TotalSeats,
                c.Amenities
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
            hasNext = page < (int)Math.Ceiling((double)totalCount / pageSize),
            hasPrev = page > 1
        });
    }

    // GET: api/coworkings/pending  (тільки admin)
    [HttpGet("pending")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetPending()
    {
        var result = await _db.Coworkings
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.City,
                c.Address,
                c.PricePerHour,
                c.Rating,
                c.Description,
                c.PhotoUrl,
                c.TotalSeats,
                c.IsApproved,
                c.Amenities
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "owner,admin")]
    public async Task<IActionResult> GetMy()
    {
        // Отримуємо OrganizationId поточного власника
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (!int.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _db.Users.FindAsync(userId);

        var query = _db.Coworkings.AsQueryable();

        // Адмін бачить всі, власник — тільки своєї організації
        if (user?.Role == "owner" && user.OrganizationId.HasValue)
            query = query.Where(c => c.OrganizationId == user.OrganizationId);

        var result = await query.Select(c => new
        {
            c.Id,
            c.Name,
            c.City,
            c.Address,
            c.PricePerHour,
            c.Rating,
            c.PhotoUrl,
            c.TotalSeats,
            c.IsApproved,
            c.Amenities,
            c.Description
        }).ToListAsync();

        return Ok(result);
    }

    // GET: api/coworkings/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var coworking = await _db.Coworkings
            .Include(c => c.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (coworking == null) return NotFound();

        return Ok(new
        {
            coworking.Id,
            coworking.Name,
            coworking.City,
            coworking.Address,
            coworking.Amenities,
            coworking.PricePerHour,
            coworking.Rating,
            coworking.Description,
            coworking.PhotoUrl,
            coworking.Latitude,
            coworking.Longitude,
            coworking.TotalSeats,
            coworking.IsApproved,
            coworking.OrganizationId,
            Reviews = coworking.Reviews.Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                Author = r.User.FirstName + " " + r.User.LastName
            })
        });
    }

    // POST: api/coworkings
    [HttpPost]
    [Authorize(Roles = "owner,admin")]
    public async Task<IActionResult> Create([FromBody] CoworkingCreateDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        // Owner має мати організацію
        if (user.Role == "owner" && user.OrganizationId == null)
            return BadRequest(new
            {
                message = "Спочатку створіть організацію у своєму профілі"
            });

        // Перевірка ліміту (тільки для basic)
        if (user.Role == "owner" && user.OrganizationId != null)
        {
            var org = await _db.Organizations.FindAsync(user.OrganizationId);
            if (org != null && !org.IsPremiumActive)
            {
                var count = await _db.Coworkings
                    .CountAsync(c => c.OrganizationId == user.OrganizationId);
                if (count >= 2)
                    return BadRequest(new
                    {
                        message = "На базовому плані можна мати лише 2 коворкінги. " +
                                  "Перейдіть на преміум для необмеженої кількості.",
                        code = "LIMIT_REACHED"
                    });
            }
        }

        var coworking = new Coworking
        {
            OrganizationId = user.OrganizationId,
            Name = dto.Name,
            City = dto.City,
            Address = dto.Address,
            Amenities = dto.Amenities,
            PricePerHour = dto.PricePerHour,
            Description = dto.Description,
            PhotoUrl = dto.PhotoUrl,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            TotalSeats = dto.TotalSeats,
            IsApproved = false
        };

        _db.Coworkings.Add(coworking);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = coworking.Id }, new
        {
            coworking.Id,
            coworking.Name,
            coworking.City,
            coworking.IsApproved,
            coworking.OrganizationId
        });
    }

    // PUT: api/coworkings/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "owner,admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CoworkingCreateDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return updated ? NoContent() : NotFound();
    }

    // PATCH: api/coworkings/{id}/approve
    [HttpPatch("{id}/approve")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Approve(int id)
    {
        var coworking = await _db.Coworkings.FindAsync(id);
        if (coworking == null) return NotFound();

        coworking.IsApproved = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/coworkings/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    // GET: api/coworkings/top  (публічний)
    [HttpGet("top")]
    public async Task<IActionResult> GetTop()
    {
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        var top = await _db.Coworkings
            .Where(c => c.IsApproved)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.City,
                c.Address,
                c.PricePerHour,
                c.Rating,
                c.PhotoUrl,
                c.TotalSeats,
                c.Amenities,
                WeeklyReviews = c.Reviews
                    .Count(r => r.CreatedAt >= weekAgo && r.Rating >= 4)
            })
            .OrderByDescending(c => c.WeeklyReviews)
            .ThenByDescending(c => c.Rating)
            .Take(3)
            .ToListAsync();

        return Ok(top);
    }
}