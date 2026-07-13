using System.Text.Json;
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
public class OrganizationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrganizationsController(AppDbContext db) => _db = db;

    private int GetUserId() => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub") ?? "0");

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    // Серіалізуємо словник у JSON рядок
    private static string? SerializeContacts(Dictionary<string, string>? contacts)
    {
        if (contacts == null || contacts.Count == 0) return null;
        // Видаляємо порожні значення
        var clean = contacts
            .Where(kv => !string.IsNullOrWhiteSpace(kv.Value))
            .ToDictionary(kv => kv.Key.Trim(), kv => kv.Value.Trim());
        return clean.Count > 0
            ? JsonSerializer.Serialize(clean, _json)
            : null;
    }

    // Десеріалізуємо JSON рядок у словник
    private static Dictionary<string, string>? DeserializeContacts(string? json)
    {
        if (string.IsNullOrEmpty(json)) return null;
        try { return JsonSerializer.Deserialize<Dictionary<string, string>>(json, _json); }
        catch { return null; }
    }

    // GET: api/organizations/{id}  (публічний)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var org = await _db.Organizations
            .Include(o => o.Coworkings.Where(c => c.IsApproved))
            .FirstOrDefaultAsync(o => o.Id == id);

        if (org == null) return NotFound();

        return Ok(new
        {
            org.Id,
            org.Name,
            org.Address,
            org.Description,
            org.LogoUrl,
            org.PlanType,
            org.IsPremiumActive,
            org.CreatedAt,
            Contacts = DeserializeContacts(org.ContactInfo),
            CoworkingsCount = org.Coworkings.Count(c => c.IsApproved),
            Coworkings = org.Coworkings
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
                    c.Amenities
                })
        });
    }

    // GET: api/organizations/my  (owner)
    [HttpGet("my")]
    [Authorize(Roles = "owner")]
    public async Task<IActionResult> GetMy()
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user?.OrganizationId == null) return Ok(null);

        var org = await _db.Organizations.FindAsync(user.OrganizationId);
        if (org == null) return NotFound();

        var count = await _db.Coworkings
            .CountAsync(c => c.OrganizationId == org.Id);

        return Ok(new
        {
            org.Id,
            org.Name,
            org.Address,
            org.Description,
            org.LogoUrl,
            org.PlanType,
            org.IsPremiumActive,
            org.PremiumUntil,
            org.CreatedAt,
            Contacts = DeserializeContacts(org.ContactInfo),
            CoworkingsCount = count
        });
    }

    // POST: api/organizations
    [HttpPost]
    [Authorize(Roles = "owner")]
    public async Task<IActionResult> Create([FromBody] OrganizationCreateDto dto)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        if (user.OrganizationId != null)
            return BadRequest(new { message = "Ви вже маєте організацію" });

        var org = new Organization
        {
            Name = dto.Name,
            Address = dto.Address,
            Description = dto.Description,
            LogoUrl = dto.LogoUrl,
            ContactInfo = SerializeContacts(dto.Contacts),
            PlanType = "basic"
        };

        _db.Organizations.Add(org);
        await _db.SaveChangesAsync();

        user.OrganizationId = org.Id;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            org.Id,
            org.Name,
            org.Address,
            org.PlanType,
            org.IsPremiumActive,
            Contacts = DeserializeContacts(org.ContactInfo)
        });
    }

    // PUT: api/organizations/my
    [HttpPut("my")]
    [Authorize(Roles = "owner")]
    public async Task<IActionResult> UpdateMy([FromBody] OrganizationUpdateDto dto)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user?.OrganizationId == null)
            return BadRequest(new { message = "Спочатку створіть організацію" });

        var org = await _db.Organizations.FindAsync(user.OrganizationId);
        if (org == null) return NotFound();

        org.Name = dto.Name;
        org.Address = dto.Address;
        org.Description = dto.Description;
        org.LogoUrl = dto.LogoUrl;
        org.ContactInfo = SerializeContacts(dto.Contacts);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            org.Id,
            org.Name,
            org.Address,
            org.Description,
            org.LogoUrl,
            org.PlanType,
            org.IsPremiumActive,
            Contacts = DeserializeContacts(org.ContactInfo)
        });
    }

    // POST: api/organizations/upgrade
    [HttpPost("upgrade")]
    [Authorize(Roles = "owner")]
    public async Task<IActionResult> Upgrade()
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user?.OrganizationId == null)
            return BadRequest(new { message = "Спочатку створіть організацію" });

        var org = await _db.Organizations.FindAsync(user.OrganizationId);
        if (org == null) return NotFound();

        org.PlanType = "premium";
        org.PremiumUntil = DateTime.UtcNow.AddMonths(1);

        await _db.SaveChangesAsync();
        return Ok(new
        {
            message = "Преміум активовано на 1 місяць!",
            org.PlanType,
            org.PremiumUntil,
            org.IsPremiumActive
        });
    }
}