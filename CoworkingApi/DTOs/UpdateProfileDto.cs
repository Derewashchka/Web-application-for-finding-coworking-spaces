namespace CoworkingApi.DTOs;

public class UpdateProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
}