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

namespace CarMaintenance.Web.Pages.Services
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly string _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents");

        public CreateModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public ServiceRecord ServiceRecord { get; set; } = default!;

        [BindProperty]
        public IFormFile? UploadedFile { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            if (!Request.Cookies.TryGetValue("ActiveCarId", out string value) || !int.TryParse(value, out int carId))
            {
                var firstCar = await _context.Cars.FirstOrDefaultAsync();
                if (firstCar == null)
                {
                    return RedirectToPage("/Cars/Index");
                }
                carId = firstCar.Id;
            }

            var car = await _context.Cars.FindAsync(carId);
            if (car == null)
            {
                return RedirectToPage("/Cars/Index");
            }

            ServiceRecord = new ServiceRecord
            {
                CarId = carId,
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

            // Set computed fields
            ServiceRecord.TotalCost = ServiceRecord.PartsCost + ServiceRecord.LaborCost;

            _context.ServiceRecords.Add(ServiceRecord);
            await _context.SaveChangesAsync();

            // Handle file upload
            if (UploadedFile != null && UploadedFile.Length > 0)
            {
                if (!Directory.Exists(_uploadFolder))
                {
                    Directory.CreateDirectory(_uploadFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(UploadedFile.FileName);
                var filePath = Path.Combine(_uploadFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await UploadedFile.CopyToAsync(stream);
                }

                var doc = new Document
                {
                    CarId = ServiceRecord.CarId,
                    ServiceRecordId = ServiceRecord.Id,
                    Name = $"Фактура: {ServiceRecord.Title}",
                    DocumentType = "Invoice",
                    IssueDate = ServiceRecord.Date,
                    FilePath = $"/uploads/documents/{uniqueFileName}",
                    Notes = $"Фактура прикачена към обслужване '{ServiceRecord.Title}'"
                };

                _context.Documents.Add(doc);
            }

            // Log Mileage in MileageHistory
            var mileageHistory = new MileageHistory
            {
                CarId = ServiceRecord.CarId,
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
