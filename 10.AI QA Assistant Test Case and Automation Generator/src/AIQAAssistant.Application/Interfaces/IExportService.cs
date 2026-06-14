using System.Threading.Tasks;
using AIQAAssistant.Domain.Entities;

namespace AIQAAssistant.Application.Interfaces;

public interface IExportService
{
    Task<byte[]> ExportAsync(HistoryRecord record, string format);
}
