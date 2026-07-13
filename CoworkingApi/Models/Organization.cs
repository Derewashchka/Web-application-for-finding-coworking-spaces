namespace CoworkingApi.Models;

public class Organization
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? ContactInfo { get; set; }
    public string PlanType { get; set; } = "basic";
    public DateTime? PremiumUntil { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Coworking> Coworkings { get; set; } = new List<Coworking>();

    public bool IsPremiumActive =>
        PlanType == "premium" &&
        (PremiumUntil == null || PremiumUntil > DateTime.UtcNow);
}