using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AIQAAssistant.Application.Interfaces;
using AIQAAssistant.Api.Models;

namespace AIQAAssistant.Api.Controllers;

[ApiController]
[Route("api/api-tests")]
public class ApiTestsController : ControllerBase
{
    private readonly IAiService _aiService;

    public ApiTestsController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] ApiTestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Endpoint))
        {
            return BadRequest(new { message = "Endpoint cannot be empty." });
        }

        var result = await _aiService.GenerateApiScenariosAsync(request.Endpoint, request.Payload);
        return Ok(result);
    }
}
