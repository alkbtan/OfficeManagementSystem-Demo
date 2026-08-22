using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EventsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Events
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Event>>> GetAll()
    {
        return await _context.Events
            .OrderByDescending(e => e.EventDate)
            .ToListAsync();
    }

    // GET: api/Events/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Event>> GetById(int id)
    {
        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null)
            return NotFound();
        return eventItem;
    }

    // POST: api/Events
    [HttpPost]
    public async Task<ActionResult<Event>> Create([FromBody] Event eventItem)
    {
        // Validate required fields
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

        // Convert date to UTC
        if (eventItem.EventDate.Kind != DateTimeKind.Utc)
        {
            eventItem.EventDate = DateTime.SpecifyKind(eventItem.EventDate, DateTimeKind.Utc);
        }

        eventItem.CreatedAt = DateTime.UtcNow;
        _context.Events.Add(eventItem);
        await _context.SaveChangesAsync();
        return Ok(eventItem);
    }

    // PUT: api/Events/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Event eventItem)
    {
        // Check if event exists
        var existingEvent = await _context.Events.FindAsync(id);
        if (existingEvent == null)
            return NotFound(new { message = "Event not found" });

        // Validate required fields
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

        // Convert date to UTC
        if (eventItem.EventDate.Kind != DateTimeKind.Utc)
        {
            eventItem.EventDate = DateTime.SpecifyKind(eventItem.EventDate, DateTimeKind.Utc);
        }

        // Update fields
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

    // DELETE: api/Events/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var eventItem = await _context.Events.FindAsync(id);
        if (eventItem == null)
            return NotFound();

        _context.Events.Remove(eventItem);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET: api/Events/upcoming
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