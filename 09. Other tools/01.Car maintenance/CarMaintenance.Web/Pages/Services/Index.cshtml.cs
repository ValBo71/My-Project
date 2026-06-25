using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;
using CarMaintenance.Core.Enums;
using CarMaintenance.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Pages.Services
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public IndexModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public Car Car { get; set; } = default!;
        public IList<ServiceRecord> ServiceRecords { get; set; } = default!;

        [BindProperty(SupportsGet = true)]
        public string? SearchQuery { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? SelectedCategory { get; set; }

        [BindProperty(SupportsGet = true)]
        public RecordType? SelectedType { get; set; }

        public decimal TotalSpent { get; set; }
        public decimal PartsSpent { get; set; }
        public decimal LaborSpent { get; set; }

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

            IQueryable<ServiceRecord> query = _context.ServiceRecords
                .Include(s => s.ServiceItems)
                .Include(s => s.AttachedDocuments)
                .Where(s => s.CarId == carId)
                .OrderByDescending(s => s.Date);

            // Apply filters
            if (!string.IsNullOrEmpty(SearchQuery))
            {
                query = query.Where(s => s.Title.Contains(SearchQuery) || 
                                         (s.Description != null && s.Description.Contains(SearchQuery)) || 
                                         (s.ServiceName != null && s.ServiceName.Contains(SearchQuery)));
            }

            if (!string.IsNullOrEmpty(SelectedCategory))
            {
                query = query.Where(s => s.Category == SelectedCategory);
            }

            if (SelectedType.HasValue)
            {
                query = query.Where(s => s.Type == SelectedType.Value);
            }

            ServiceRecords = await query.ToListAsync();

            // Calculate totals
            TotalSpent = ServiceRecords.Sum(s => s.TotalCost);
            PartsSpent = ServiceRecords.Sum(s => s.PartsCost);
            LaborSpent = ServiceRecords.Sum(s => s.LaborCost);

            return Page();
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            var record = await _context.ServiceRecords
                .Include(r => r.AttachedDocuments)
                .FirstOrDefaultAsync(r => r.Id == id);
            
            if (record != null)
            {
                var carId = record.CarId;

                // Delete attached files if any
                foreach (var doc in record.AttachedDocuments)
                {
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", doc.FilePath.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        try { System.IO.File.Delete(filePath); } catch {}
                    }
                    _context.Documents.Remove(doc);
                }

                // Delete associated mileage history entry if it matches the service date and mileage
                var historyEntry = await _context.MileageHistories
                    .FirstOrDefaultAsync(m => m.CarId == carId && m.Mileage == record.Mileage && m.Source == "ServiceLog");
                if (historyEntry != null)
                {
                    _context.MileageHistories.Remove(historyEntry);
                }

                _context.ServiceRecords.Remove(record);
                await _context.SaveChangesAsync();

                // Recalculate car's current mileage to max in history
                var maxMileage = await _context.MileageHistories
                    .Where(m => m.CarId == carId)
                    .MaxAsync(m => (int?)m.Mileage) ?? 0;
                
                var car = await _context.Cars.FindAsync(carId);
                if (car != null)
                {
                    car.CurrentMileage = maxMileage;
                    await _context.SaveChangesAsync();
                }
            }

            return RedirectToPage();
        }
    }
}
