using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LockersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LockersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Lockers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Locker>>> GetAll()
    {
        return await _context.Lockers
            .OrderBy(l => l.Number)
            .ToListAsync();
    }

    // GET: api/Lockers/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Locker>> GetById(int id)
    {
        var locker = await _context.Lockers.FindAsync(id);
        if (locker == null)
            return NotFound();
        return locker;
    }

    // POST: api/Lockers
    [HttpPost]
    public async Task<ActionResult<Locker>> Create([FromBody] Locker locker)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(locker.Number))
            return BadRequest(new { message = "Locker number is required" });

        if (string.IsNullOrWhiteSpace(locker.Location))
            return BadRequest(new { message = "Location is required" });

        // Check for duplicate locker number
        var existing = await _context.Lockers
            .FirstOrDefaultAsync(l => l.Number == locker.Number);
        if (existing != null)
            return BadRequest(new { message = $"Locker {locker.Number} already exists" });

        locker.CreatedAt = DateTime.UtcNow;
        _context.Lockers.Add(locker);
        await _context.SaveChangesAsync();

        return Ok(locker);
    }

    // PUT: api/Lockers/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Locker locker)
    {
        // Check if locker exists
        var existingLocker = await _context.Lockers.FindAsync(id);
        if (existingLocker == null)
            return NotFound(new { message = "Locker not found" });

        // Validate required fields
        if (string.IsNullOrWhiteSpace(locker.Number))
            return BadRequest(new { message = "Locker number is required" });

        if (string.IsNullOrWhiteSpace(locker.Location))
            return BadRequest(new { message = "Location is required" });

        // Check for duplicate locker number (excluding current locker)
        var duplicate = await _context.Lockers
            .FirstOrDefaultAsync(l => l.Number == locker.Number && l.Id != id);
        if (duplicate != null)
            return BadRequest(new { message = $"Locker {locker.Number} already exists" });

        // Update fields
        existingLocker.Number = locker.Number;
        existingLocker.Location = locker.Location;
        existingLocker.Status = locker.Status;
        existingLocker.LockType = locker.LockType;
        existingLocker.AssignedTo = locker.AssignedTo;
        existingLocker.AssignedToName = locker.AssignedToName;
        existingLocker.BiometricEnabled = locker.BiometricEnabled;

        await _context.SaveChangesAsync();
        return Ok(existingLocker);
    }

    // DELETE: api/Lockers/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var locker = await _context.Lockers.FindAsync(id);
        if (locker == null)
            return NotFound();

        _context.Lockers.Remove(locker);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}