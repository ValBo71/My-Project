using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarMaintenance.Core.Entities
{
    public class Document
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CarId { get; set; }

        [ForeignKey("CarId")]
        public Car Car { get; set; }

        public int? ServiceRecordId { get; set; }

        [ForeignKey("ServiceRecordId")]
        public ServiceRecord ServiceRecord { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, MaxLength(50)]
        public string DocumentType { get; set; }

        [Required]
        public DateTime IssueDate { get; set; }

        public DateTime? ValidUntil { get; set; }

        [Required, MaxLength(250)]
        public string FilePath { get; set; }

        public string? Notes { get; set; }
    }
}
