namespace CoworkingApi.Models;

public class Coworking
{
    public int Id { get; set; }
    public int? OrganizationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Amenities { get; set; }   // JSON-рядок або comma-separated
    public decimal PricePerHour { get; set; }
    public double Rating { get; set; } = 0;
    public string? Description { get; set; }
    public string? PhotoUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int TotalSeats { get; set; } = 1;
    public bool IsApproved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Organization? Organization { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}