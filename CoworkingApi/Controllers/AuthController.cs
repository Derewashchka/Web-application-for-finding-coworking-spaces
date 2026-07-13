using CoworkingApi.DTOs.Auth;
using CoworkingApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace CoworkingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IAuditService _audit;

    public AuthController(IAuthService authService, IAuditService audit)
    {
        _authService = authService;
        _audit = audit;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var token = await _authService.RegisterAsync(dto);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (token == null)
        {
            await _audit.LogAsync("REGISTER_FAILED", "Auth",
                details: $"Дублікат email: {dto.Email}", ip: ip);
            return BadRequest(new { message = "Користувач з таким email вже існує" });
        }

        await _audit.LogAsync("REGISTER", "User",
            details: $"Новий користувач: {dto.Email} ({dto.Role})", ip: ip);
        return Ok(new { token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (token == null)
        {
            await _audit.LogAsync("LOGIN_FAILED", "Auth",
                details: $"Спроба входу: {dto.Email}", ip: ip);
            return Unauthorized(new { message = "Невірний email або пароль" });
        }

        await _audit.LogAsync("LOGIN", "Auth",
            details: $"Успішний вхід: {dto.Email}", ip: ip);
        return Ok(new { token });
    }
}