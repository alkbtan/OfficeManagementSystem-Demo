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
public class EventsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EventsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Event>>> GetAll()
    {
        return await _context.Events
            .OrderByDescending(e => e.EventDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetById(int id)
    {
        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null)
            return NotFound();
        return eventItem;
    }

    [HttpPost]
    public async Task<ActionResult<Event>> Create([FromBody] Event eventItem)
    {
        if (string.IsNullOrWhiteSpace(eventItem.Title))
            return BadRequest(new { message = "Title is required" });

        if (eventItem.EventDate == default)
            return BadRequest(new { message = "Date is required" });

        if (string.IsNullOrWhiteSpace(eventItem.Time))
            return BadRequest(new { message = "Time is required" });

        if (string.IsNullOrWhiteSpace(eventItem.Location))
            return BadRequest(new { message = "Location is required" });

        if (string.IsNullOrWhiteSpace(eventItem.Type))
            return BadRequest(new { message = "Type is required" });

        if (eventItem.EventDate.Kind != DateTimeKind.Utc)
            eventItem.EventDate = DateTime.SpecifyKind(eventItem.EventDate, DateTimeKind.Utc);

        eventItem.CreatedBy = CurrentUsername;
        eventItem.CreatedAt = DateTime.UtcNow;
        _context.Events.Add(eventItem);
        await _context.SaveChangesAsync();
        return Ok(eventItem);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Event eventItem)
    {
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null)
            return NotFound(new { message = "Event not found" });

        if (!CanDeleteAny && existingEvent.CreatedBy != CurrentUsername)
            return Forbid();

        if (string.IsNullOrWhiteSpace(eventItem.Title))
            return BadRequest(new { message = "Title is required" });

        if (eventItem.EventDate == default)
            return BadRequest(new { message = "Date is required" });

        if (string.IsNullOrWhiteSpace(eventItem.Time))
            return BadRequest(new { message = "Time is required" });

        if (string.IsNullOrWhiteSpace(eventItem.Location))
            return BadRequest(new { message = "Location is required" });

        if (string.IsNullOrWhiteSpace(eventItem.Type))
            return BadRequest(new { message = "Type is required" });

        if (eventItem.EventDate.Kind != DateTimeKind.Utc)
            eventItem.EventDate = DateTime.SpecifyKind(eventItem.EventDate, DateTimeKind.Utc);

        existingEvent.Title = eventItem.Title;
        existingEvent.Description = eventItem.Description ?? string.Empty;
        existingEvent.EventDate = eventItem.EventDate;
        existingEvent.Time = eventItem.Time;
        existingEvent.Location = eventItem.Location;
        existingEvent.Type = eventItem.Type;
        existingEvent.Status = eventItem.Status;
        existingEvent.Preparation = eventItem.Preparation ?? string.Empty;
        existingEvent.Equipment = eventItem.Equipment ?? string.Empty;

        await _context.SaveChangesAsync();
        return Ok(existingEvent);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null)
            return NotFound();

        if (!CanDeleteAny && eventItem.CreatedBy != CurrentUsername)
            return Forbid();

        _context.Events.Remove(eventItem);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<Event>>> GetUpcoming()
    {
        var now = DateTime.UtcNow;
        return await _context.Events
            .Where(e => e.Status == "Upcoming" && e.EventDate >= now)
            .OrderBy(e => e.EventDate)
            .Take(5)
            .ToListAsync();
    }
}