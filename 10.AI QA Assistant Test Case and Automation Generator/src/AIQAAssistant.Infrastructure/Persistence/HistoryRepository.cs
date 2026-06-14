using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Domain.Entities;

namespace AIQAAssistant.Infrastructure.Persistence;

public class HistoryRepository : IHistoryRepository
{
    private readonly AppDbContext _context;

    public HistoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HistoryRecord>> GetAllAsync()
    {
        return await _context.HistoryRecords
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<HistoryRecord?> GetByIdAsync(Guid id)
    {
        return await _context.HistoryRecords.FindAsync(id);
    }

    public async Task<HistoryRecord> AddAsync(HistoryRecord record)
    {
        if (record.Id == Guid.Empty)
        {
            record.Id = Guid.NewGuid();
        }
        if (record.CreatedAt == default)
        {
            record.CreatedAt = DateTime.UtcNow;
        }

        _context.HistoryRecords.Add(record);
        await _context.SaveChangesAsync();
        return record;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var record = await _context.HistoryRecords.FindAsync(id);
        if (record == null)
        {
            return false;
        }

        _context.HistoryRecords.Remove(record);
        await _context.SaveChangesAsync();
        return true;
    }
}
