using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiftManager.Core.Model.DTO;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ShiftManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MovementController : ControllerBase
    {
        private readonly ShiftManagerContext _context;
        private readonly IMapper _mapper;

        public MovementController(ShiftManagerContext context, IMapper mapper) {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/<MovementController>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var movements = await _context.Movements
                .Select(x => _mapper.Map<MovementDTO>(x))
                .ToArrayAsync();
            return Ok(movements);
        }

        // GET api/<MovementController>/5
        [HttpGet("{start}-{end}")]
        public async Task<IActionResult> Get(DateTime start, DateTime end)
        {
            var movement = await _context.Movements
                .FirstOrDefaultAsync(x => x.Time >= start && x.Time >= end);

            return Ok(_mapper.Map<MovementDTO>(movement));
        }

        // POST api/<MovementController>
        [HttpPost]
        public void Post([FromBody] MovementDTO value)
        {
        }

        // PUT api/<MovementController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<MovementController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
