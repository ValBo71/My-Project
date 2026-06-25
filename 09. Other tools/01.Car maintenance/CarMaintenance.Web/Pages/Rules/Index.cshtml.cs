using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Infrastructure.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Pages.Rules
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public IndexModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public Car Car { get; set; } = default!;
        public IList<MaintenanceRule> MaintenanceRules { get; set; } = default!;

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
                Response.Cookies.Append("ActiveCarId", carId.ToString());
            }

            var car = await _context.Cars.FindAsync(carId);
            if (car == null)
            {
                return RedirectToPage("/Cars/Index");
            }
            Car = car;

            MaintenanceRules = await _context.MaintenanceRules
                .Where(r => r.CarId == carId)
                .ToListAsync();

            // Run status calculations
            foreach (var rule in MaintenanceRules)
            {
                MaintenanceCalculator.CalculateNextDue(rule, Car.CurrentMileage);
            }
            await _context.SaveChangesAsync();

            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            var rule = await _context.MaintenanceRules.FindAsync(id);
            if (rule != null)
            {
                _context.MaintenanceRules.Remove(rule);
                await _context.SaveChangesAsync();
            }
            return RedirectToPage();
        }
    }
}
