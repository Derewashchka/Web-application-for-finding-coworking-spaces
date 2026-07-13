using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CoworkingApi.Data;
using CoworkingApi.DTOs.Auth;
using CoworkingApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CoworkingApi.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEncryptionService _enc;

    public AuthService(AppDbContext db, IConfiguration config, IEncryptionService enc)
    {
        _db = db;
        _config = config;
        _enc = enc;
    }

    public async Task<string?> RegisterAsync(RegisterDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLower();

        // EF Core сам зашифрує normalizedEmail під капотом для перевірки AnyAsync
        if (await _db.Users.AnyAsync(u => u.Email == normalizedEmail))
            return null;

        var user = new User
        {
            Email = normalizedEmail, // EF конвертер зашифрує це значення при збереженні
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Phone = dto.Phone?.Trim(),
            Role = dto.Role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return GenerateTokenForUser(user);
    }

    public async Task<string?> LoginAsync(LoginDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLower();

        // EF Core сам зашифрує normalizedEmail і порівняє із зашифрованим значенням у БД
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        // Якщо користувача не знайдено, або пароль невірний
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return GenerateTokenForUser(user);
    }

    public string GenerateTokenForUser(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email ?? ""),
            new Claim(ClaimTypes.Role,           user.Role),
            new Claim(ClaimTypes.GivenName,      user.FirstName ?? ""),
            new Claim(ClaimTypes.Surname,        user.LastName ?? "")
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiresInMinutes"]!)),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}