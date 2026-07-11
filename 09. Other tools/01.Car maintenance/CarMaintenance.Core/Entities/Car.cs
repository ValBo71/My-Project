using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CarMaintenance.Core.Enums;

namespace CarMaintenance.Core.Entities
{
    public class Car
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Make { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Model { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Engine { get; set; } = string.Empty;

        [Required]
        public int Year { get; set; }

        [MaxLength(17)]
        public string? Vin { get; set; }

        [Required, MaxLength(15)]
        public string RegistrationNumber { get; set; } = string.Empty;

        [Required]
        public FuelType Fuel { get; set; }

        [Required]
        public int CurrentMileage { get; set; }

        public string? Notes { get; set; }

        [MaxLength(250)]
        public string? ImagePath { get; set; }

        // Navigation Properties
        public ICollection<ServiceRecord> ServiceRecords { get; set; } = new List<ServiceRecord>();
        public ICollection<MaintenanceRule> MaintenanceRules { get; set; } = new List<MaintenanceRule>();
        public ICollection<Document> Documents { get; set; } = new List<Document>();
        public ICollection<MileageHistory> MileageHistories { get; set; } = new List<MileageHistory>();
    }
}
