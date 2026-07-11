using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CarMaintenance.Core.Entities;
using CarMaintenance.Core.Enums;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Infrastructure.Services;
using CarMaintenance.Web.Services;

namespace CarMaintenance.Web.Pages.Services
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly ActiveCarService _activeCarService;
        private readonly string _uploadFolder = FileUploadValidator.GetUploadFolder("documents");

        public CreateModel(ApplicationDbContext context, ActiveCarService activeCarService)
        {
            _context = context;
            _activeCarService = activeCarService;
        }

        [BindProperty]
        public ServiceRecord ServiceRecord { get; set; } = default!;

        [BindProperty]
        public IFormFile? UploadedFile { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            var car = await _activeCarService.GetActiveCarAsync(Request, Response);
            if (car == null)
            {
                return RedirectToPage("/Cars/Index");
            }

            ServiceRecord = new ServiceRecord
            {
                CarId = car.Id,
                Date = DateTime.Today,
                Mileage = car.CurrentMileage,
                Type = RecordType.Service
            };

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // Validate the file upload before persisting anything, so a rejected file
            // doesn't leave an orphaned ServiceRecord behind.
            if (UploadedFile != null && UploadedFile.Length > 0)
            {
                var validation = FileUploadValidator.Validate(UploadedFile, FileUploadValidator.DocumentExtensions, FileUploadValidator.DocumentContentTypes, FileUploadValidator.MaxDocumentSizeBytes);
                if (!validation.IsValid)
                {
                    ModelState.AddModelError(nameof(UploadedFile), validation.Error!);
                    return Page();
                }
            }

            // Set computed fields
            ServiceRecord.TotalCost = ServiceRecord.PartsCost + ServiceRecord.LaborCost;

            _context.ServiceRecords.Add(ServiceRecord);
            await _context.SaveChangesAsync();

            // Handle file upload
            if (UploadedFile != null && UploadedFile.Length > 0)
            {
                var filePath = await FileUploadValidator.SaveAsync(UploadedFile, _uploadFolder, "/uploads/documents");

                var doc = new Document
                {
                    CarId = ServiceRecord.CarId,
                    ServiceRecordId = ServiceRecord.Id,
                    Name = $"Фактура: {ServiceRecord.Title}",
                    DocumentType = "Invoice",
                    IssueDate = ServiceRecord.Date,
                    FilePath = filePath,
                    Notes = $"Фактура прикачена към обслужване '{ServiceRecord.Title}'"
                };

                _context.Documents.Add(doc);
            }

            // Log Mileage in MileageHistory
            var mileageHistory = new MileageHistory
            {
                CarId = ServiceRecord.CarId,
                ServiceRecordId = ServiceRecord.Id,
                Date = ServiceRecord.Date,
                Mileage = ServiceRecord.Mileage,
                Source = "ServiceLog",
                Notes = $"Запис от сервизен дневник: {ServiceRecord.Title}"
            };
            _context.MileageHistories.Add(mileageHistory);

            // Update car current mileage if it is higher than the car's current mileage
            var car = await _context.Cars.FindAsync(ServiceRecord.CarId);
            if (car != null && ServiceRecord.Mileage > car.CurrentMileage)
            {
                car.CurrentMileage = ServiceRecord.Mileage;
            }

            await _context.SaveChangesAsync();

            // Re-evaluate maintenance rules due to potential mileage update
            var rules = await _context.MaintenanceRules.Where(r => r.CarId == ServiceRecord.CarId).ToListAsync();
            foreach (var rule in rules)
            {
                // Check if this rule category matches this service record category
                if (rule.Category == ServiceRecord.Category)
                {
                    // Update only if this service record is newer or higher mileage than what's recorded
                    if (!rule.LastDoneMileage.HasValue || ServiceRecord.Mileage > rule.LastDoneMileage.Value)
                    {
                        rule.LastDoneMileage = ServiceRecord.Mileage;
                        rule.LastDoneDate = ServiceRecord.Date;
                    }
                }
                CarMaintenance.Infrastructure.Services.MaintenanceCalculator.CalculateNextDue(rule, car?.CurrentMileage ?? ServiceRecord.Mileage);
            }
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
