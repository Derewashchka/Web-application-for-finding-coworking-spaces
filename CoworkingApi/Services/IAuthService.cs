using CoworkingApi.Models;

namespace CoworkingApi.Services;

public interface IAuthService
{
    Task<string?> RegisterAsync(DTOs.Auth.RegisterDto dto);
    Task<string?> LoginAsync(DTOs.Auth.LoginDto dto);
    string GenerateTokenForUser(User user);
}