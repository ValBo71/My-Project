using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;
using CarMaintenance.Core.Entities;
using CarMaintenance.Core.Enums;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Infrastructure.Services;

namespace CarMaintenance.Web.Pages.Cars
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly string _uploadFolder = FileUploadValidator.GetUploadFolder("cars");

        public CreateModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Car Car { get; set; } = default!;

        [BindProperty]
        public IFormFile? UploadedImage { get; set; }

        public IActionResult OnGet()
        {
            Car = new Car { Year = DateTime.Today.Year, Fuel = FuelType.Diesel };
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            // Handle image upload
            if (UploadedImage != null && UploadedImage.Length > 0)
            {
                var validation = FileUploadValidator.Validate(UploadedImage, FileUploadValidator.ImageExtensions, FileUploadValidator.ImageContentTypes, FileUploadValidator.MaxImageSizeBytes);
                if (!validation.IsValid)
                {
                    ModelState.AddModelError(nameof(UploadedImage), validation.Error!);
                    return Page();
                }

                Car.ImagePath = await FileUploadValidator.SaveAsync(UploadedImage, _uploadFolder, "/uploads/cars");
            }
            else
            {
                Car.ImagePath = "/images/default_car.png";
            }

            _context.Cars.Add(Car);
            await _context.SaveChangesAsync();

            // Set active if it is the only car
            var carsCount = await _context.Cars.CountAsync();
            if (carsCount == 1)
            {
                Response.Cookies.Append("ActiveCarId", Car.Id.ToString());
            }

            // Save initial mileage in history
            var history = new MileageHistory
            {
                CarId = Car.Id,
                Date = DateTime.Today,
                Mileage = Car.CurrentMileage,
                Source = "Manual",
                Notes = "Първоначално въвеждане на пробег."
            };
            _context.MileageHistories.Add(history);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
