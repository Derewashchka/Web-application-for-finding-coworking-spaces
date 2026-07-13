namespace CoworkingApi.DTOs;

public class CoworkingCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Amenities { get; set; }
    public decimal PricePerHour { get; set; }
    public string? Description { get; set; }
    public string? PhotoUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int TotalSeats { get; set; } = 1;
}

public class CoworkingFilterDto
{
    public string? City { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public string? Amenity { get; set; }
}