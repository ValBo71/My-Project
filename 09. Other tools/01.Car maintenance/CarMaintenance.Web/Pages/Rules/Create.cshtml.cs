using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Infrastructure.Services;

namespace CarMaintenance.Web.Pages.Rules
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public CreateModel(ApplicationDbContext context)
        {
            _context = context;
        }

        [BindProperty]
        public MaintenanceRule MaintenanceRule { get; set; } = default!;

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

            MaintenanceRule = new MaintenanceRule
            {
                CarId = carId,
                WarningKmBefore = 1000,
                WarningDaysBefore = 30,
                Status = "Gray"
            };

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var car = await _context.Cars.FindAsync(MaintenanceRule.CarId);
            if (car == null)
            {
                return RedirectToPage("/Cars/Index");
            }

            // Perform calculations
            MaintenanceCalculator.CalculateNextDue(MaintenanceRule, car.CurrentMileage);

            _context.MaintenanceRules.Add(MaintenanceRule);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
    }
}
