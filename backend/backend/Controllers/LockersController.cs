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
public class LockersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LockersController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Locker>>> GetAll()
    {
        return await _context.Lockers
            .OrderBy(l => l.Number)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Locker>> GetById(int id)
    {
        var locker = await _context.Lockers.FindAsync(id);
        if (locker == null)
            return NotFound();
        return locker;
    }

    [HttpPost]
    public async Task<ActionResult<Locker>> Create([FromBody] Locker locker)
    {
        if (string.IsNullOrWhiteSpace(locker.Number))
            return BadRequest(new { message = "Locker number is required" });

        if (string.IsNullOrWhiteSpace(locker.Location))
            return BadRequest(new { message = "Location is required" });

        var existing = await _context.Lockers
            .FirstOrDefaultAsync(l => l.Number == locker.Number);
        if (existing != null)
            return BadRequest(new { message = $"Locker {locker.Number} already exists" });

        locker.CreatedBy = CurrentUsername;
        locker.CreatedAt = DateTime.UtcNow;
        _context.Lockers.Add(locker);
        await _context.SaveChangesAsync();

        return Ok(locker);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Locker locker)
    {
        var existingLocker = await _context.Lockers.FindAsync(id);
        if (existingLocker == null)
            return NotFound(new { message = "Locker not found" });

        if (!CanDeleteAny && existingLocker.CreatedBy != CurrentUsername)
            return Forbid();

        if (string.IsNullOrWhiteSpace(locker.Number))
            return BadRequest(new { message = "Locker number is required" });

        if (string.IsNullOrWhiteSpace(locker.Location))
            return BadRequest(new { message = "Location is required" });

        var duplicate = await _context.Lockers
            .FirstOrDefaultAsync(l => l.Number == locker.Number && l.Id != id);
        if (duplicate != null)
            return BadRequest(new { message = $"Locker {locker.Number} already exists" });

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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var locker = await _context.Lockers.FindAsync(id);
        if (locker == null)
            return NotFound();

        if (!CanDeleteAny && locker.CreatedBy != CurrentUsername)
            return Forbid();

        _context.Lockers.Remove(locker);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}