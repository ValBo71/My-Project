using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public IndexModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public Car? Car { get; set; }
        public IList<ServiceRecord> RecentServices { get; set; } = new List<ServiceRecord>();
        public IList<MaintenanceRule> OverdueRules { get; set; } = new List<MaintenanceRule>();
        public IList<MaintenanceRule> WarningRules { get; set; } = new List<MaintenanceRule>();
        public decimal TotalSpentThisYear { get; set; }
        public int CarsCount { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            CarsCount = await _context.Cars.CountAsync();
            if (CarsCount == 0)
            {
                return RedirectToPage("/Cars/Index");
            }

            int carId;
            if (Request.Cookies.TryGetValue("ActiveCarId", out string value) && int.TryParse(value, out int activeId))
            {
                carId = activeId;
            }
            else
            {
                var firstCar = await _context.Cars.FirstOrDefaultAsync();
                carId = firstCar!.Id;
                Response.Cookies.Append("ActiveCarId", carId.ToString());
            }

            Car = await _context.Cars.FindAsync(carId);
            if (Car == null)
            {
                Response.Cookies.Delete("ActiveCarId");
                return RedirectToPage("/Cars/Index");
            }

            // Get recent service logs
            RecentServices = await _context.ServiceRecords
                .Where(s => s.CarId == carId)
                .OrderByDescending(s => s.Date)
                .Take(5)
                .ToListAsync();

            // Get overdue and upcoming rules
            var rules = await _context.MaintenanceRules
                .Where(r => r.CarId == carId)
                .ToListAsync();

            // Run status calculations dynamically to ensure freshness
            foreach (var rule in rules)
            {
                CarMaintenance.Infrastructure.Services.MaintenanceCalculator.CalculateNextDue(rule, Car.CurrentMileage);
            }
            await _context.SaveChangesAsync();

            OverdueRules = rules.Where(r => r.Status == "Red").ToList();
            WarningRules = rules.Where(r => r.Status == "Yellow").ToList();

            // Calculate spent this year
            int currentYear = DateTime.Today.Year;
            TotalSpentThisYear = await _context.ServiceRecords
                .Where(s => s.CarId == carId && s.Date.Year == currentYear)
                .SumAsync(s => s.TotalCost);

            return Page();
        }
    }
}
