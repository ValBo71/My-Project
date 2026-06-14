using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Api.Models;

namespace AIQAAssistant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestCasesController : ControllerBase
{
    private readonly IAiService _aiService;

    public TestCasesController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] TestCaseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Requirement))
        {
            return BadRequest(new { message = "Requirement cannot be empty." });
        }

        var result = await _aiService.GenerateTestCasesAsync(request.Requirement);
        return Ok(result);
    }
}
