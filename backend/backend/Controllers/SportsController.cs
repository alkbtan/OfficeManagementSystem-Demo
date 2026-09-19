using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;
using System.Security.Claims;

namespace OfficeManagementAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SportsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sport>>> GetAll()
    {
        return await _context.Sports
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Sport>> GetById(int id)
    {
        var sport = await _context.Sports.FindAsync(id);
        if (sport == null)
            return NotFound();
        return sport;
    }

    [HttpPost]
    public async Task<ActionResult<Sport>> Create([FromBody] Sport sport)
    {
        if (string.IsNullOrWhiteSpace(sport.Name))
            return BadRequest(new { message = "Match Name is required" });

        if (sport.Date == default)
            return BadRequest(new { message = "Date is required" });

        if (string.IsNullOrWhiteSpace(sport.Time))
            return BadRequest(new { message = "Time is required" });

        if (sport.Date.Kind != DateTimeKind.Utc)
            sport.Date = DateTime.SpecifyKind(sport.Date, DateTimeKind.Utc);

        sport.CreatedBy = CurrentUsername;
        sport.CreatedAt = DateTime.UtcNow;
        _context.Sports.Add(sport);
        await _context.SaveChangesAsync();
        return Ok(sport);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Sport sport)
    {
        var existingSport = await _context.Sports.FindAsync(id);
        if (existingSport == null)
            return NotFound(new { message = "Sport not found" });

        if (!CanDeleteAny && existingSport.CreatedBy != CurrentUsername)
            return Forbid();

        if (string.IsNullOrWhiteSpace(sport.Name))
            return BadRequest(new { message = "Match Name is required" });

        if (sport.Date == default)
            return BadRequest(new { message = "Date is required" });

        if (string.IsNullOrWhiteSpace(sport.Time))
            return BadRequest(new { message = "Time is required" });

        if (sport.Date.Kind != DateTimeKind.Utc)
            sport.Date = DateTime.SpecifyKind(sport.Date, DateTimeKind.Utc);

        existingSport.Name = sport.Name;
        existingSport.Date = sport.Date;
        existingSport.Time = sport.Time;
        existingSport.Preparation = sport.Preparation ?? string.Empty;
        existingSport.Equipment = sport.Equipment ?? string.Empty;
        existingSport.Status = sport.Status;

        await _context.SaveChangesAsync();
        return Ok(existingSport);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sport = await _context.Sports.FindAsync(id);
        if (sport == null)
            return NotFound();

        if (!CanDeleteAny && sport.CreatedBy != CurrentUsername)
            return Forbid();

        _context.Sports.Remove(sport);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<Sport>>> GetActive()
    {
        return await _context.Sports
            .Where(s => s.Status == "Ready" || s.Status == "Preparing")
            .ToListAsync();
    }
}