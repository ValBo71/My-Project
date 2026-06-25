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

namespace CarMaintenance.Web.Pages.Cars
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly string _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cars");

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
                if (!Directory.Exists(_uploadFolder))
                {
                    Directory.CreateDirectory(_uploadFolder);
                }

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(UploadedImage.FileName);
                var filePath = Path.Combine(_uploadFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await UploadedImage.CopyToAsync(stream);
                }

                Car.ImagePath = $"/uploads/cars/{uniqueFileName}";
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
