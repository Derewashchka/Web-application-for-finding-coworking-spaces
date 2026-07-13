namespace CoworkingApi.DTOs;

public class ReviewCreateDto
{
    public int CoworkingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}