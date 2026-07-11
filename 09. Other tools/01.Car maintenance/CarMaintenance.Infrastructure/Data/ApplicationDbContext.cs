using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;

namespace CarMaintenance.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Car> Cars { get; set; }
        public DbSet<ServiceRecord> ServiceRecords { get; set; }
        public DbSet<ServiceItem> ServiceItems { get; set; }
        public DbSet<MaintenanceRule> MaintenanceRules { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<MileageHistory> MileageHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Car relations
            modelBuilder.Entity<Car>()
                .HasMany(c => c.ServiceRecords)
                .WithOne(s => s.Car)
                .HasForeignKey(s => s.CarId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Car>()
                .HasMany(c => c.MaintenanceRules)
                .WithOne(m => m.Car)
                .HasForeignKey(m => m.CarId)
                .OnDelete(DeleteBehavior.Cascade);

            // Restrict (not Cascade) because Documents also cascades from ServiceRecords via
            // SetNull below - SQL Server rejects a second cascade path from Car to the same
            // table. Deleting a Car's Documents is instead handled explicitly in application
            // code (Cars/Index OnPostDeleteAsync) before the Car itself is removed.
            modelBuilder.Entity<Car>()
                .HasMany(c => c.Documents)
                .WithOne(d => d.Car)
                .HasForeignKey(d => d.CarId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Car>()
                .HasMany(c => c.MileageHistories)
                .WithOne(m => m.Car)
                .HasForeignKey(m => m.CarId)
                .OnDelete(DeleteBehavior.Cascade);

            // Links a mileage-history row back to the service record that produced it, so
            // deleting a service record can remove the exact matching history row (done
            // explicitly in Services/Index.OnPostDeleteAsync). Restrict (not SetNull/Cascade)
            // because Car already cascades to both ServiceRecords and MileageHistories
            // directly - a second cascading path between them would create the same
            // "multiple cascade paths" conflict SQL Server rejects for Documents above.
            modelBuilder.Entity<MileageHistory>()
                .HasOne<ServiceRecord>()
                .WithMany()
                .HasForeignKey(m => m.ServiceRecordId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ServiceRecord relations
            modelBuilder.Entity<ServiceRecord>()
                .HasMany(s => s.ServiceItems)
                .WithOne(i => i.ServiceRecord)
                .HasForeignKey(i => i.ServiceRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ServiceRecord>()
                .HasMany(s => s.AttachedDocuments)
                .WithOne(d => d.ServiceRecord)
                .HasForeignKey(d => d.ServiceRecordId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Decimals precision
            modelBuilder.Entity<ServiceRecord>()
                .Property(s => s.PartsCost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceRecord>()
                .Property(s => s.LaborCost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceRecord>()
                .Property(s => s.TotalCost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceItem>()
                .Property(s => s.Quantity)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceItem>()
                .Property(s => s.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceItem>()
                .Property(s => s.TotalPrice)
                .HasPrecision(18, 2);
        }
    }
}
