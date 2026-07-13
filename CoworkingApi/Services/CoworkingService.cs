using CoworkingApi.Data;
using CoworkingApi.DTOs;
using CoworkingApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CoworkingApi.Services;

public class CoworkingService : ICoworkingService
{
    private readonly AppDbContext _db;

    public CoworkingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<object>> GetAllAsync(CoworkingFilterDto filter)
    {
        var query = _db.Coworkings
            .Where(c => c.IsApproved)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.City))
            query = query.Where(c => c.City.Contains(filter.City));

        if (filter.MinPrice.HasValue)
            query = query.Where(c => c.PricePerHour >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(c => c.PricePerHour <= filter.MaxPrice.Value);

        if (filter.MinRating.HasValue)
            query = query.Where(c => c.Rating >= filter.MinRating.Value);

        if (!string.IsNullOrEmpty(filter.Amenity))
            query = query.Where(c =>
                c.Amenities != null && c.Amenities.Contains(filter.Amenity));

        return await query.Select(c => new
        {
            c.Id,
            c.Name,
            c.City,
            c.Address,
            c.PricePerHour,
            c.Rating,
            c.Description,
            c.PhotoUrl,
            c.Latitude,
            c.Longitude,
            c.TotalSeats,
            c.Amenities
        }).ToListAsync<object>();
    }

    public async Task<Coworking?> GetByIdAsync(int id)
    {
        return await _db.Coworkings
            .Include(c => c.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Coworking> CreateAsync(CoworkingCreateDto dto)
    {
        var coworking = new Coworking
        {
            Name = dto.Name,
            City = dto.City,
            Address = dto.Address,
            Amenities = dto.Amenities,
            PricePerHour = dto.PricePerHour,
            Description = dto.Description,
            PhotoUrl = dto.PhotoUrl,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            TotalSeats = dto.TotalSeats,
            IsApproved = false
        };

        _db.Coworkings.Add(coworking);
        await _db.SaveChangesAsync();
        return coworking;
    }

    public async Task<bool> UpdateAsync(int id, CoworkingCreateDto dto)
    {
        var coworking = await _db.Coworkings.FindAsync(id);
        if (coworking == null) return false;

        coworking.Name = dto.Name;
        coworking.City = dto.City;
        coworking.Address = dto.Address;
        coworking.Amenities = dto.Amenities;
        coworking.PricePerHour = dto.PricePerHour;
        coworking.Description = dto.Description;
        coworking.PhotoUrl = dto.PhotoUrl;
        coworking.Latitude = dto.Latitude;
        coworking.Longitude = dto.Longitude;
        coworking.TotalSeats = dto.TotalSeats;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApproveAsync(int id)
    {
        var coworking = await _db.Coworkings.FindAsync(id);
        if (coworking == null) return false;

        coworking.IsApproved = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var coworking = await _db.Coworkings.FindAsync(id);
        if (coworking == null) return false;

        _db.Coworkings.Remove(coworking);
        await _db.SaveChangesAsync();
        return true;
    }
}