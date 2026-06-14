using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Application.DTOs;
using AIQAAssistant.Api.Models;

namespace AIQAAssistant.Api.Controllers;

[ApiController]
public class HistoryController : ControllerBase
{
    private readonly IHistoryRepository _historyRepository;
    private readonly IExportService _exportService;

    public HistoryController(IHistoryRepository historyRepository, IExportService exportService)
    {
        _historyRepository = historyRepository;
        _exportService = exportService;
    }

    [HttpGet("api/history")]
    public async Task<IActionResult> GetAll()
    {
        var records = await _historyRepository.GetAllAsync();
        var dtos = records.Select(r => new HistoryRecordDto
        {
            Id = r.Id,
            Type = r.Type,
            InputData = r.InputData,
            OutputResult = r.OutputResult,
            CreatedAt = r.CreatedAt
        });
        return Ok(dtos);
    }

    [HttpGet("api/history/{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var record = await _historyRepository.GetByIdAsync(id);
        if (record == null)
        {
            return NotFound(new { message = $"History record with ID {id} not found." });
        }

        var dto = new HistoryRecordDto
        {
            Id = record.Id,
            Type = record.Type,
            InputData = record.InputData,
            OutputResult = record.OutputResult,
            CreatedAt = record.CreatedAt
        };
        return Ok(dto);
    }

    [HttpDelete("api/history/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _historyRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = $"History record with ID {id} not found." });
        }
        return NoContent();
    }

    [HttpPost("api/export/{id:guid}")]
    public async Task<IActionResult> Export(Guid id, [FromBody] ExportRequest request)
    {
        var record = await _historyRepository.GetByIdAsync(id);
        if (record == null)
        {
            return NotFound(new { message = $"History record with ID {id} not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Format))
        {
            return BadRequest(new { message = "Export format must be specified (json, csv, markdown, docx)." });
        }

        try
        {
            byte[] fileBytes = await _exportService.ExportAsync(record, request.Format);
            string contentType = request.Format.ToLowerInvariant() switch
            {
                "json" => "application/json",
                "csv" => "text/csv",
                "markdown" => "text/markdown",
                "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _ => "application/octet-stream"
            };

            string extension = request.Format.ToLowerInvariant() switch
            {
                "markdown" => "md",
                _ => request.Format.ToLowerInvariant()
            };

            string fileName = $"export_{record.Type}_{id}.{extension}";
            return File(fileBytes, contentType, fileName);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
