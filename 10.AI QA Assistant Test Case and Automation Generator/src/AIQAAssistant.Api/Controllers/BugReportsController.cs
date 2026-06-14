using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Api.Models;

namespace AIQAAssistant.Api.Controllers;

[ApiController]
[Route("api/bug-report")]
public class BugReportsController : ControllerBase
{
    private readonly IAiService _aiService;

    public BugReportsController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] BugReportRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new { message = "Description cannot be empty." });
        }

        var result = await _aiService.GenerateBugReportAsync(request.Description);
        return Ok(result);
    }
}
