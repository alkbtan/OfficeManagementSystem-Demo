using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Sports
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sport>>> GetAll()
    {
        return await _context.Sports
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Sports/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Sport>> GetById(int id)
    {
        var sport = await _context.Sports.FindAsync(id);
        if (sport == null)
            return NotFound();
        return sport;
    }

    // POST: api/Sports
    [HttpPost]
    public async Task<ActionResult<Sport>> Create([FromBody] Sport sport)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(sport.Name))
            return BadRequest(new { message = "Match Name is required" });

        if (sport.Date == default)
            return BadRequest(new { message = "Date is required" });

        if (string.IsNullOrWhiteSpace(sport.Time))
            return BadRequest(new { message = "Time is required" });

        // Convert date to UTC
        if (sport.Date.Kind != DateTimeKind.Utc)
        {
            sport.Date = DateTime.SpecifyKind(sport.Date, DateTimeKind.Utc);
        }

        sport.CreatedAt = DateTime.UtcNow;
        _context.Sports.Add(sport);
        await _context.SaveChangesAsync();
        return Ok(sport);
    }

    // PUT: api/Sports/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Sport sport)
    {
        // Check if sport exists
        var existingSport = await _context.Sports.FindAsync(id);
        if (existingSport == null)
            return NotFound(new { message = "Sport not found" });

        // Validate required fields
        if (string.IsNullOrWhiteSpace(sport.Name))
            return BadRequest(new { message = "Match Name is required" });

        if (sport.Date == default)
            return BadRequest(new { message = "Date is required" });

        if (string.IsNullOrWhiteSpace(sport.Time))
            return BadRequest(new { message = "Time is required" });

        // Convert date to UTC
        if (sport.Date.Kind != DateTimeKind.Utc)
        {
            sport.Date = DateTime.SpecifyKind(sport.Date, DateTimeKind.Utc);
        }

        // Update fields
        existingSport.Name = sport.Name;
        existingSport.Date = sport.Date;
        existingSport.Time = sport.Time;
        existingSport.Preparation = sport.Preparation ?? string.Empty;
        existingSport.Equipment = sport.Equipment ?? string.Empty;
        existingSport.Status = sport.Status;

        await _context.SaveChangesAsync();

        return Ok(existingSport);
    }

    // DELETE: api/Sports/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sport = await _context.Sports.FindAsync(id);
        if (sport == null)
            return NotFound();

        _context.Sports.Remove(sport);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET: api/Sports/active
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<Sport>>> GetActive()
    {
        return await _context.Sports
            .Where(s => s.Status == "Ready" || s.Status == "Preparing")
            .ToListAsync();
    }
}