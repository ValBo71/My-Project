using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Pages.Cars
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ApplicationDbContext context, ILogger<IndexModel> logger)
        {
            _context = context;
            _logger = logger;
        }

        public IList<Car> Cars { get; set; } = default!;
        public int? ActiveCarId { get; set; }

        public async Task OnGetAsync()
        {
            Cars = await _context.Cars.ToListAsync();
            
            if (Request.Cookies.TryGetValue("ActiveCarId", out string? value) && int.TryParse(value, out int activeId))
            {
                ActiveCarId = activeId;
            }
            else if (Cars.Count > 0)
            {
                ActiveCarId = Cars[0].Id;
                Response.Cookies.Append("ActiveCarId", ActiveCarId.Value.ToString());
            }
        }

        public IActionResult OnPostSetActive(int id)
        {
            Response.Cookies.Append("ActiveCarId", id.ToString());
            return RedirectToPage("/Index");
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            var car = await _context.Cars
                .Include(c => c.Documents)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (car != null)
            {
                // Documents cascade-delete in the DB, but their files on disk need explicit cleanup.
                foreach (var doc in car.Documents)
                {
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", doc.FilePath.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        try { System.IO.File.Delete(filePath); }
                        catch (IOException ex) { _logger.LogWarning(ex, "Could not delete document file {FilePath}", filePath); }
                    }
                }

                if (!string.IsNullOrEmpty(car.ImagePath) && car.ImagePath != "/images/default_car.png")
                {
                    var carImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", car.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(carImagePath))
                    {
                        try { System.IO.File.Delete(carImagePath); }
                        catch (IOException ex) { _logger.LogWarning(ex, "Could not delete car image {FilePath}", carImagePath); }
                    }
                }

                try
                {
                    // Documents→Car is Restrict at the DB level (see ApplicationDbContext), so
                    // they must be removed explicitly before the car itself.
                    _context.Documents.RemoveRange(car.Documents);
                    _context.Cars.Remove(car);
                    await _context.SaveChangesAsync();

                    if (Request.Cookies.TryGetValue("ActiveCarId", out string? value) && int.TryParse(value, out int activeId) && activeId == id)
                    {
                        Response.Cookies.Delete("ActiveCarId");
                    }
                }
                catch (DbUpdateException ex)
                {
                    _logger.LogError(ex, "Failed to delete car {CarId}", id);
                    TempData["ErrorMessage"] = "Изтриването на автомобила се провали. Опитайте отново.";
                }
            }
            return RedirectToPage();
        }
    }
}
