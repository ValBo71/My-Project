using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarMaintenance.Core.Entities
{
    public class ServiceItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ServiceRecordId { get; set; }

        [ForeignKey("ServiceRecordId")]
        public ServiceRecord ServiceRecord { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(50)]
        public string? Brand { get; set; }

        [MaxLength(50)]
        public string? PartNumber { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [MaxLength(100)]
        public string? Supplier { get; set; }

        public string? Notes { get; set; }
    }
}
