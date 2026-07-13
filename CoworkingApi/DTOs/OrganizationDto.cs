namespace CoworkingApi.DTOs;

public class OrganizationCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Dictionary<string, string>? Contacts { get; set; }
}

public class OrganizationUpdateDto : OrganizationCreateDto { }