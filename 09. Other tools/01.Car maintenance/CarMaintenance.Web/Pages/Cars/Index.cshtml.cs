using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Pages.Cars
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public IndexModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<Car> Cars { get; set; } = default!;
        public int? ActiveCarId { get; set; }

        public async Task OnGetAsync()
        {
            Cars = await _context.Cars.ToListAsync();
            
            if (Request.Cookies.TryGetValue("ActiveCarId", out string value) && int.TryParse(value, out int activeId))
            {
                ActiveCarId = activeId;
            }
            else if (Cars.Count > 0)
            {
                ActiveCarId = Cars[0].Id;
                Response.Cookies.Append("ActiveCarId", ActiveCarId.ToString());
            }
        }

        public IActionResult OnPostSetActive(int id)
        {
            Response.Cookies.Append("ActiveCarId", id.ToString());
            return RedirectToPage("/Index");
        }

        public async Task<IActionResult> OnPostDeleteAsync(int id)
        {
            var car = await _context.Cars.FindAsync(id);
            if (car != null)
            {
                _context.Cars.Remove(car);
                await _context.SaveChangesAsync();

                if (Request.Cookies.TryGetValue("ActiveCarId", out string value) && int.TryParse(value, out int activeId) && activeId == id)
                {
                    Response.Cookies.Delete("ActiveCarId");
                }
            }
            return RedirectToPage();
        }
    }
}
