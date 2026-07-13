namespace CoworkingApi.Models;

public class Booking
{
    public int Id { get; set; }
    public int CoworkingId { get; set; }
    public int UserId { get; set; }
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }
    public string Status { get; set; } = "pending";
    public decimal TotalPrice { get; set; }
    public string? PaymentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Coworking Coworking { get; set; } = null!;
    public User User { get; set; } = null!;
}