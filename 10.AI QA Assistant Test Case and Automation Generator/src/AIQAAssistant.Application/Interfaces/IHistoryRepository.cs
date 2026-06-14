using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIQAAssistant.Domain.Entities;

namespace AIQAAssistant.Application.Interfaces;

public interface IHistoryRepository
{
    Task<IEnumerable<HistoryRecord>> GetAllAsync();
    Task<HistoryRecord?> GetByIdAsync(Guid id);
    Task<HistoryRecord> AddAsync(HistoryRecord record);
    Task<bool> DeleteAsync(Guid id);
}
