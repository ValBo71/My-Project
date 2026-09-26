using Microsoft.EntityFrameworkCore;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// The entities are bound directly by the forms. With nullable reference types enabled, MVC
// would treat every non-nullable navigation property (e.g. ServiceRecord.Car) as implicitly
// [Required]; the forms never post it, so ModelState was always invalid and nothing saved.
// Every field that really is required carries an explicit [Required] attribute instead.
builder.Services.AddRazorPages()
    .AddMvcOptions(o => o.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true);
builder.Services.AddScoped<ActiveCarService>();

// Add DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("CarMaintenance.Web")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

// Seed Database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred creating or seeding the database.");
    }
}

app.Run();
