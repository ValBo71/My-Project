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
        public Car Car { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int Mileage { get; set; }

        [Required, MaxLength(50)]
        public string Source { get; set; }

        public string? Notes { get; set; }
    }
}
