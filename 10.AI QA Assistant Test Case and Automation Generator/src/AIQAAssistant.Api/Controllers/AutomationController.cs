using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Api.Models;

namespace AIQAAssistant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AutomationController : ControllerBase
{
    private readonly IAiService _aiService;

    public AutomationController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] AutomationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Requirement))
        {
            return BadRequest(new { message = "Requirement cannot be empty." });
        }

        var result = await _aiService.GenerateAutomationSkeletonAsync(request.Requirement);
        return Ok(result);
    }
}
