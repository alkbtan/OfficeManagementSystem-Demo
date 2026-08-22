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

    // GET: api/Tickets
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Ticket>>> GetAll()
    {
        return await _context.Tickets
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Tickets/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Ticket>> GetById(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return NotFound();
        return ticket;
    }

    // POST: api/Tickets
    [HttpPost]
    public async Task<ActionResult<Ticket>> Create([FromBody] Ticket ticket)
    {
        if (string.IsNullOrWhiteSpace(ticket.Title))
            return BadRequest(new { message = "Title is required" });

        ticket.CreatedAt = DateTime.UtcNow;
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return Ok(ticket);
    }

    // PUT: api/Tickets/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Ticket ticket)
    {
        // Check if ticket exists
        var existingTicket = await _context.Tickets.FindAsync(id);
        if (existingTicket == null)
            return NotFound(new { message = "Ticket not found" });

        // Validate required fields
        if (string.IsNullOrWhiteSpace(ticket.Title))
            return BadRequest(new { message = "Title is required" });

        // Update fields
        existingTicket.Title = ticket.Title;
        existingTicket.Description = ticket.Description ?? string.Empty;
        existingTicket.Status = ticket.Status;
        existingTicket.Priority = ticket.Priority;
        existingTicket.AssignedTo = ticket.AssignedTo ?? string.Empty;
        
        // ✅ NEW FIELDS
        existingTicket.JiraTicket = ticket.JiraTicket ?? string.Empty;
        existingTicket.Link = ticket.Link ?? string.Empty;
        existingTicket.Amount = ticket.Amount;
        existingTicket.Date = ticket.Date;
        existingTicket.Floor = ticket.Floor ?? string.Empty;
        existingTicket.Company = ticket.Company ?? string.Empty;

        await _context.SaveChangesAsync();
        return Ok(existingTicket);
    }

    // DELETE: api/Tickets/{id}
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
}