// Program.cs for the packaged (installer) build. build_installer.py copies it over
// CarMaintenance.Web/Program.cs in a temporary copy of the project. Differences from the
// development Program.cs: a local SQLite database in the user's data folder instead of
// SQL Server LocalDB, no sample data (a new installation starts empty), uploads and
// data-protection keys kept in the data folder, and no HTTPS redirect (it runs on
// http://127.0.0.1:18766 only).
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using CarMaintenance.Infrastructure.Data;
using CarMaintenance.Web.Services;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
    WebRootPath = "wwwroot"
});
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// The launcher sets CAR_MAINTENANCE_DATA_DIR and starts the app with the data folder as the
// working directory, so uploads (saved under <cwd>/wwwroot/uploads) land there too.
var dataDir = Environment.GetEnvironmentVariable("CAR_MAINTENANCE_DATA_DIR");
if (string.IsNullOrWhiteSpace(dataDir))
{
    dataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CarMaintenance", "data");
}
Directory.CreateDirectory(dataDir);
Directory.CreateDirectory(Path.Combine(dataDir, "keys"));
var dataWebRoot = Path.Combine(dataDir, "wwwroot");
Directory.CreateDirectory(dataWebRoot);

// Same as the development Program.cs: the forms bind the entities directly, so the
// implicit [Required] on non-nullable navigation properties must be switched off.
builder.Services.AddRazorPages()
    .AddMvcOptions(o => o.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true);
builder.Services.AddScoped<ActiveCarService>();
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(dataDir, "keys")))
    .SetApplicationName("CarMaintenance");

var connectionString = "Data Source=" + Path.Combine(dataDir, "car-maintenance.db");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(connectionString));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(dataWebRoot) });

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

// Create the (empty) database on first start. No sample data is seeded.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        services.GetRequiredService<ApplicationDbContext>().Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        services.GetRequiredService<ILogger<Program>>().LogError(ex, "An error occurred creating the database.");
    }
}

app.Run();
