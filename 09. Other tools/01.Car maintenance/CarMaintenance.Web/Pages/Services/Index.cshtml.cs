using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CarMaintenance.Core.Entities;
using CarMaintenance.Core.Enums;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Web.Services;
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
        private readonly ActiveCarService _activeCarService;
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ApplicationDbContext context, ActiveCarService activeCarService, ILogger<IndexModel> logger)
        {
            _context = context;
            _activeCarService = activeCarService;
            _logger = logger;
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
            var car = await _activeCarService.GetActiveCarAsync(Request, Response);
            if (car == null)
            {
                return RedirectToPage("/Cars/Index");
            }
            Car = car;
            var carId = car.Id;

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
                        try { System.IO.File.Delete(filePath); }
                        catch (IOException ex) { _logger.LogWarning(ex, "Could not delete document file {FilePath}", filePath); }
                    }
                    _context.Documents.Remove(doc);
                }

                // Delete the mileage-history entry this exact record created (matched by
                // ServiceRecordId, not by mileage/date, which can collide across records).
                var historyEntry = await _context.MileageHistories
                    .FirstOrDefaultAsync(m => m.ServiceRecordId == record.Id);
                if (historyEntry != null)
                {
                    _context.MileageHistories.Remove(historyEntry);
                }

                _context.ServiceRecords.Remove(record);
                await _context.SaveChangesAsync();

                // Recalculate car's current mileage to the max of what remains in history.
                // If no history remains, leave the car's mileage untouched instead of zeroing it.
                var maxMileage = await _context.MileageHistories
                    .Where(m => m.CarId == carId)
                    .Select(m => (int?)m.Mileage)
                    .MaxAsync();

                if (maxMileage.HasValue)
                {
                    var car = await _context.Cars.FindAsync(carId);
                    if (car != null)
                    {
                        car.CurrentMileage = maxMileage.Value;
                        await _context.SaveChangesAsync();
                    }
                }
            }

            return RedirectToPage();
        }
    }
}
