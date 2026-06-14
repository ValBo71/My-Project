using Microsoft.EntityFrameworkCore;
using AIQAAssistant.Domain.Entities;

namespace AIQAAssistant.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<HistoryRecord> HistoryRecords => Set<HistoryRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<HistoryRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.InputData).IsRequired();
            entity.Property(e => e.OutputResult).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });
    }
}
