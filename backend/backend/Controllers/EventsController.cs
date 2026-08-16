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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Event>>> GetAll()
    {
        return await _context.Events
            .OrderBy(e => e.EventDate)
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
    public async Task<ActionResult<Event>> Create(Event eventItem)
    {
        eventItem.CreatedAt = DateTime.UtcNow;
        _context.Events.Add(eventItem);
        await _context.SaveChangesAsync();
        return Ok(eventItem);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Event eventItem)
    {
        if (id != eventItem.Id)
            return BadRequest();

        _context.Entry(eventItem).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(eventItem);
    }

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

    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<Event>>> GetUpcoming()
    {
        return await _context.Events
            .Where(e => e.Status == "Upcoming" && e.EventDate >= DateTime.UtcNow)
            .OrderBy(e => e.EventDate)
            .Take(5)
            .ToListAsync();
    }
}