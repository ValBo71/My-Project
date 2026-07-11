using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CarMaintenance.Core.Enums;

namespace CarMaintenance.Core.Entities
{
    public class ServiceRecord
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

        [Required]
        public RecordType Type { get; set; }

        [Required, MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(100)]
        public string? ServiceName { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PartsCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LaborCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }

        public string? Notes { get; set; }

        // Navigation Properties
        public ICollection<ServiceItem> ServiceItems { get; set; } = new List<ServiceItem>();
        public ICollection<Document> AttachedDocuments { get; set; } = new List<Document>();
    }
}
