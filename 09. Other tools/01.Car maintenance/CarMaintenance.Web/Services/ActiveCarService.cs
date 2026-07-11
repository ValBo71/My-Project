using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using CarMaintenance.Core.Entities;
using CarMaintenance.Infrastructure.Data;
using System.Threading.Tasks;

namespace CarMaintenance.Web.Services
{
    // Centralizes the "which car is currently selected" logic (ActiveCarId cookie),
    // previously duplicated across Index, Rules and Services pages.
    public class ActiveCarService
    {
        private readonly ApplicationDbContext _context;

        public ActiveCarService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Car?> GetActiveCarAsync(HttpRequest request, HttpResponse response)
        {
            Car? car = null;

            if (request.Cookies.TryGetValue("ActiveCarId", out var value) && int.TryParse(value, out var activeId))
            {
                car = await _context.Cars.FindAsync(activeId);
            }

            if (car == null)
            {
                // Cookie missing, malformed, or pointing at a car that no longer exists.
                car = await _context.Cars.FirstOrDefaultAsync();
                if (car == null)
                {
                    response.Cookies.Delete("ActiveCarId");
                    return null;
                }
                response.Cookies.Append("ActiveCarId", car.Id.ToString());
            }

            return car;
        }
    }
}
