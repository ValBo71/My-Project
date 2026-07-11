using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Infrastructure.Services;
using CarMaintenance.Web.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Pages.Rules
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

        public Car Car { get; set; } = default!;
        public IList<MaintenanceRule> MaintenanceRules { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync()
        {
            var car = await _activeCarService.GetActiveCarAsync(Request, Response);
            if (car == null)
            {
                return RedirectToPage("/Cars/Index");
            }
            Car = car;

            // Loaded untracked and never saved: this is a GET request, so rule status is
            // computed live for display only, never persisted.
            MaintenanceRules = await _context.MaintenanceRules
                .AsNoTracking()
                .Where(r => r.CarId == car.Id)
                .ToListAsync();

            foreach (var rule in MaintenanceRules)
            {
                MaintenanceCalculator.CalculateNextDue(rule, Car.CurrentMileage);
            }

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
