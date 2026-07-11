using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarMaintenance.Core.Entities
{
    public class MileageHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CarId { get; set; }

        [ForeignKey("CarId")]
        public Car Car { get; set; } = null!;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int Mileage { get; set; }

        [Required, MaxLength(50)]
        public string Source { get; set; } = string.Empty;

        public string? Notes { get; set; }

        // Links this history entry to the service record that produced it, so it can be
        // found and removed precisely when the record is deleted (mileage/date alone can collide).
        public int? ServiceRecordId { get; set; }
    }
}
