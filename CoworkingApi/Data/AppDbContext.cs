using CoworkingApi.Models;
using CoworkingApi.Services;
using Microsoft.EntityFrameworkCore;

namespace CoworkingApi.Data;

public class AppDbContext : DbContext
{
    private readonly IEncryptionService _enc;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        IEncryptionService enc) : base(options)
    {
        _enc = enc;
    }

    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Coworking> Coworkings => Set<Coworking>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var converter = new EncryptedStringConverter(_enc);

        // ── Шифрування полів User ──────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.FirstName)
                  .HasConversion(converter);

            entity.Property(u => u.LastName)
                  .HasConversion(converter);

            entity.Property(u => u.Phone)
                  .HasConversion(converter);

            entity.Property(u => u.Email)
                  .HasConversion(converter);

            entity.HasIndex(u => u.Email)
                  .IsUnique()
                  .HasFilter(null); // унікальність по зашифрованому значенню
        });

        // ── Інші конфігурації ──────────────────────────────────
        modelBuilder.Entity<Coworking>()
            .Property(c => c.PricePerHour).HasPrecision(10, 2);

        modelBuilder.Entity<Booking>()
            .Property(b => b.TotalPrice).HasPrecision(10, 2);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Coworking)
            .WithMany(c => c.Bookings)
            .HasForeignKey(b => b.CoworkingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Coworking)
            .WithMany(c => c.Reviews)
            .HasForeignKey(r => r.CoworkingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}