using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TicketsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Ticket>>> GetAll()
    {
        return await _context.Tickets.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Ticket>> GetById(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return NotFound();
        return ticket;
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> Create(Ticket ticket)
    {
        ticket.CreatedAt = DateTime.UtcNow;
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return Ok(ticket);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Ticket ticket)
    {
        if (id != ticket.Id)
            return BadRequest();

        ticket.UpdatedAt = DateTime.UtcNow;
        _context.Entry(ticket).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(ticket);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Tickets.CountAsync();
        var open = await _context.Tickets.CountAsync(t => t.Status == "Open");
        var inProgress = await _context.Tickets.CountAsync(t => t.Status == "In Progress");
        var closed = await _context.Tickets.CountAsync(t => t.Status == "Closed");

        return Ok(new { total, open, inProgress, closed });
    }
}