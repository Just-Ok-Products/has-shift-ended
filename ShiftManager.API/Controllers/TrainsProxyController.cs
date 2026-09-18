using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace ShiftManager.API.Controllers
{
    /// <summary>
    /// Puro proxy passthrough verso le API di lefrecce.it: nessuna logica applicativa,
    /// nessun uso di ShiftManagerContext/EF Core. Necessario perché lefrecce.it non espone
    /// header CORS e quindi non è chiamabile direttamente da un frontend statico su GitHub Pages.
    /// </summary>
    [Route("api/trains")]
    [ApiController]
    [EnableCors("TrainsProxy")]
    public class TrainsProxyController : ControllerBase
    {
        private const string ClientName = "Trenitalia";

        private readonly IHttpClientFactory _httpClientFactory;

        public TrainsProxyController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        // GET api/trains/stations?name=...
        [HttpGet("stations")]
        public async Task<IActionResult> GetStations([FromQuery] string name)
        {
            var client = _httpClientFactory.CreateClient(ClientName);
            var response = await client.GetAsync($"website/locations/search?name={Uri.EscapeDataString(name ?? string.Empty)}");
            return await ForwardAsync(response);
        }

        // POST api/trains/solutions
        [HttpPost("solutions")]
        public async Task<IActionResult> PostSolutions()
        {
            var client = _httpClientFactory.CreateClient(ClientName);
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            using var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");
            var response = await client.PostAsync("website/ticket/solutions", content);
            return await ForwardAsync(response);
        }

        private static async Task<IActionResult> ForwardAsync(HttpResponseMessage response)
        {
            var content = await response.Content.ReadAsStringAsync();
            return new ContentResult
            {
                Content = content,
                ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json",
                StatusCode = (int)response.StatusCode
            };
        }
    }
}
