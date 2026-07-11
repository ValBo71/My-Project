using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Infrastructure.Services;
using CarMaintenance.Web.Services;

namespace CarMaintenance.Web.Pages.Rules
{
    public class CreateModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly ActiveCarService _activeCarService;

        public CreateModel(ApplicationDbContext context, ActiveCarService activeCarService)
        {
            _context = context;
            _activeCarService = activeCarService;
        }

        [BindProperty]
        public MaintenanceRule MaintenanceRule { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync()
        {
            var car = await _activeCarService.GetActiveCarAsync(Request, Response);
            if (car == null)
            {
                return RedirectToPage("/Cars/Index");
            }

            MaintenanceRule = new MaintenanceRule
            {
                CarId = car.Id,
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
