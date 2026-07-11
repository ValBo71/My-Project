using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Web.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly ActiveCarService _activeCarService;

        public IndexModel(ApplicationDbContext context, ActiveCarService activeCarService)
        {
            _context = context;
            _activeCarService = activeCarService;
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

            Car = await _activeCarService.GetActiveCarAsync(Request, Response);
            if (Car == null)
            {
                return RedirectToPage("/Cars/Index");
            }
            var carId = Car.Id;

            // Get recent service logs
            RecentServices = await _context.ServiceRecords
                .Where(s => s.CarId == carId)
                .OrderByDescending(s => s.Date)
                .Take(5)
                .ToListAsync();

            // Get overdue and upcoming rules. Loaded untracked and never saved here: this is a
            // GET request, so status is computed live for display only, never persisted.
            var rules = await _context.MaintenanceRules
                .AsNoTracking()
                .Where(r => r.CarId == carId)
                .ToListAsync();

            foreach (var rule in rules)
            {
                CarMaintenance.Infrastructure.Services.MaintenanceCalculator.CalculateNextDue(rule, Car.CurrentMileage);
            }

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
