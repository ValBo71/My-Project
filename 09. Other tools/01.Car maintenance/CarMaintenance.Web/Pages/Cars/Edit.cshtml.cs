using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CarMaintenance.Core.Entities;
using CarMaintenance.Core.Enums;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Infrastructure.Services;

namespace CarMaintenance.Web.Pages.Cars
{
    public class EditModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EditModel> _logger;
        private readonly string _uploadFolder = FileUploadValidator.GetUploadFolder("cars");

        public EditModel(ApplicationDbContext context, ILogger<EditModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        [BindProperty]
        public Car Car { get; set; } = default!;

        [BindProperty]
        public IFormFile? UploadedImage { get; set; }

        public async Task<IActionResult> OnGetAsync(int id)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car == null)
            {
                return NotFound();
            }
            Car = car;
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var carToUpdate = await _context.Cars.FindAsync(Car.Id);
            if (carToUpdate == null)
            {
                return NotFound();
            }

            carToUpdate.Make = Car.Make;
            carToUpdate.Model = Car.Model;
            carToUpdate.Engine = Car.Engine;
            carToUpdate.Year = Car.Year;
            carToUpdate.Vin = Car.Vin;
            carToUpdate.RegistrationNumber = Car.RegistrationNumber;
            carToUpdate.Fuel = Car.Fuel;
            
            // Check if mileage changed - if yes, log to history and update
            if (Car.CurrentMileage != carToUpdate.CurrentMileage)
            {
                var history = new MileageHistory
                {
                    CarId = Car.Id,
                    Date = DateTime.Today,
                    Mileage = Car.CurrentMileage,
                    Source = "Manual",
                    Notes = $"Ръчно коригиран пробег от {carToUpdate.CurrentMileage} на {Car.CurrentMileage} км."
                };
                _context.MileageHistories.Add(history);
                carToUpdate.CurrentMileage = Car.CurrentMileage;
            }

            carToUpdate.Notes = Car.Notes;

            // Handle image upload if a new one was provided
            if (UploadedImage != null && UploadedImage.Length > 0)
            {
                var validation = FileUploadValidator.Validate(UploadedImage, FileUploadValidator.ImageExtensions, FileUploadValidator.ImageContentTypes, FileUploadValidator.MaxImageSizeBytes);
                if (!validation.IsValid)
                {
                    ModelState.AddModelError(nameof(UploadedImage), validation.Error!);
                    return Page();
                }

                var newImagePath = await FileUploadValidator.SaveAsync(UploadedImage, _uploadFolder, "/uploads/cars");

                // Delete old image if it wasn't the default one
                if (!string.IsNullOrEmpty(carToUpdate.ImagePath) && carToUpdate.ImagePath != "/images/default_car.png")
                {
                    var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", carToUpdate.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        try { System.IO.File.Delete(oldFilePath); }
                        catch (IOException ex) { _logger.LogWarning(ex, "Could not delete old car image {FilePath}", oldFilePath); }
                    }
                }

                carToUpdate.ImagePath = newImagePath;
            }

            await _context.SaveChangesAsync();

            // Re-evaluate maintenance rules due to potential mileage update
            var rules = await _context.MaintenanceRules.Where(r => r.CarId == Car.Id).ToListAsync();
            foreach (var rule in rules)
            {
                CarMaintenance.Infrastructure.Services.MaintenanceCalculator.CalculateNextDue(rule, carToUpdate.CurrentMileage);
            }
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
