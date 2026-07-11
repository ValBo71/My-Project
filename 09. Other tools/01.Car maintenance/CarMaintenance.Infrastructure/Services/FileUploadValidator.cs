using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace CarMaintenance.Infrastructure.Services
{
    public class FileValidationResult
    {
        public bool IsValid { get; set; }
        public string? Error { get; set; }

        public static FileValidationResult Ok() => new() { IsValid = true };
        public static FileValidationResult Fail(string error) => new() { IsValid = false, Error = error };
    }

    public static class FileUploadValidator
    {
        public static readonly string[] ImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        public static readonly string[] ImageContentTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
        public const long MaxImageSizeBytes = 5 * 1024 * 1024;

        public static readonly string[] DocumentExtensions = { ".pdf", ".jpg", ".jpeg", ".png" };
        public static readonly string[] DocumentContentTypes = { "application/pdf", "image/jpeg", "image/png" };
        public const long MaxDocumentSizeBytes = 10 * 1024 * 1024;

        public static FileValidationResult Validate(IFormFile file, string[] allowedExtensions, string[] allowedContentTypes, long maxSizeBytes)
        {
            if (file.Length <= 0)
            {
                return FileValidationResult.Fail("Файлът е празен.");
            }

            if (file.Length > maxSizeBytes)
            {
                return FileValidationResult.Fail($"Файлът е твърде голям (макс. {maxSizeBytes / 1024 / 1024} MB).");
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return FileValidationResult.Fail($"Неподдържан тип файл. Разрешени разширения: {string.Join(", ", allowedExtensions)}");
            }

            if (!allowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            {
                return FileValidationResult.Fail("Съдържанието на файла не отговаря на разрешените типове.");
            }

            return FileValidationResult.Ok();
        }

        public static string GetUploadFolder(string subfolder) =>
            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", subfolder);

        // The saved filename is always regenerated (GUID + validated extension) and never derived
        // from the caller-supplied file name, so the original name can't be used for path traversal.
        public static async Task<string> SaveAsync(IFormFile file, string physicalFolder, string publicUrlPrefix)
        {
            if (!Directory.Exists(physicalFolder))
            {
                Directory.CreateDirectory(physicalFolder);
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(physicalFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"{publicUrlPrefix}/{uniqueFileName}";
        }
    }
}
