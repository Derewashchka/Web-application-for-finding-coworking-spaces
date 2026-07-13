using CoworkingApi.DTOs;
using CoworkingApi.Models;

namespace CoworkingApi.Services;

public interface ICoworkingService
{
    Task<IEnumerable<object>> GetAllAsync(CoworkingFilterDto filter);
    Task<Coworking?> GetByIdAsync(int id);
    Task<Coworking> CreateAsync(CoworkingCreateDto dto);
    Task<bool> UpdateAsync(int id, CoworkingCreateDto dto);
    Task<bool> ApproveAsync(int id);
    Task<bool> DeleteAsync(int id);
}