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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sport>>> GetAll()
    {
        return await _context.Sports.ToListAsync();
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
    public async Task<ActionResult<Sport>> Create(Sport sport)
    {
        sport.CreatedAt = DateTime.UtcNow;
        _context.Sports.Add(sport);
        await _context.SaveChangesAsync();
        return Ok(sport);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Sport sport)
    {
        if (id != sport.Id)
            return BadRequest();

        _context.Entry(sport).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(sport);
    }

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

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<Sport>>> GetActive()
    {
        return await _context.Sports
            .Where(s => s.Status == "Active")
            .ToListAsync();
    }
}