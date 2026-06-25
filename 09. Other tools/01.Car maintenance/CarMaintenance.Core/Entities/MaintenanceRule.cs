using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarMaintenance.Core.Entities
{
    public class MaintenanceRule
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CarId { get; set; }

        [ForeignKey("CarId")]
        public Car Car { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, MaxLength(50)]
        public string Category { get; set; }

        public int? IntervalKm { get; set; }

        public int? IntervalMonths { get; set; }

        public int? LastDoneMileage { get; set; }

        public DateTime? LastDoneDate { get; set; }

        public int? NextDueMileage { get; set; }

        public DateTime? NextDueDate { get; set; }

        public int WarningKmBefore { get; set; } = 1000;

        public int WarningDaysBefore { get; set; } = 30;

        [Required, MaxLength(20)]
        public string Status { get; set; } = "Gray";
    }
}
