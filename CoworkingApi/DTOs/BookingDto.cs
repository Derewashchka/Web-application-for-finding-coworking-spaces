namespace CoworkingApi.DTOs;

public class BookingCreateDto
{
    public int CoworkingId { get; set; }
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }
}