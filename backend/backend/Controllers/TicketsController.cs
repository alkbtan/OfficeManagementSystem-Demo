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
public class TicketsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TicketsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Ticket>>> GetAll()
    {
        return await _context.Tickets
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
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
    public async Task<ActionResult<Ticket>> Create([FromBody] Ticket ticket)
    {
        if (string.IsNullOrWhiteSpace(ticket.Title))
            return BadRequest(new { message = "Title is required" });

        ticket.CreatedBy = CurrentUsername;
        ticket.CreatedAt = DateTime.UtcNow;
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return Ok(ticket);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Ticket ticket)
    {
        var existingTicket = await _context.Tickets.FindAsync(id);
        if (existingTicket == null)
            return NotFound(new { message = "Ticket not found" });

        if (!CanDeleteAny && existingTicket.CreatedBy != CurrentUsername)
            return Forbid();

        if (string.IsNullOrWhiteSpace(ticket.Title))
            return BadRequest(new { message = "Title is required" });

        existingTicket.Title = ticket.Title;
        existingTicket.Description = ticket.Description ?? string.Empty;
        existingTicket.Status = ticket.Status;
        existingTicket.Priority = ticket.Priority;
        existingTicket.AssignedTo = ticket.AssignedTo ?? string.Empty;

        existingTicket.JiraTicket = ticket.JiraTicket ?? string.Empty;
        existingTicket.Link = ticket.Link ?? string.Empty;
        existingTicket.Amount = ticket.Amount;
        existingTicket.Date = ticket.Date;
        existingTicket.Floor = ticket.Floor ?? string.Empty;
        existingTicket.Company = ticket.Company ?? string.Empty;

        await _context.SaveChangesAsync();
        return Ok(existingTicket);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null)
            return NotFound();

        if (!CanDeleteAny && ticket.CreatedBy != CurrentUsername)
            return Forbid();

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}