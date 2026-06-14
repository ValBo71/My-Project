using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Api.Models;

namespace AIQAAssistant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EdgeCasesController : ControllerBase
{
    private readonly IAiService _aiService;

    public EdgeCasesController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] EdgeCaseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Requirement))
        {
            return BadRequest(new { message = "Requirement cannot be empty." });
        }

        var result = await _aiService.GenerateEdgeCasesAsync(request.Requirement);
        return Ok(result);
    }
}
