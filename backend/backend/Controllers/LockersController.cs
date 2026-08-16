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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Locker>>> GetAll()
    {
        return await _context.Lockers.ToListAsync();
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
    public async Task<ActionResult<Locker>> Create(Locker locker)
    {
        locker.CreatedAt = DateTime.UtcNow;
        // If AssignedTo is 0, set to null
        if (locker.AssignedTo == 0)
        {
            locker.AssignedTo = null;
        }
        _context.Lockers.Add(locker);
        await _context.SaveChangesAsync();
        return Ok(locker);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Locker locker)
    {
        if (id != locker.Id)
            return BadRequest();

        _context.Entry(locker).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(locker);
    }

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

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Lockers.CountAsync();
        var available = await _context.Lockers.CountAsync(l => l.Status == "Available");
        var occupied = await _context.Lockers.CountAsync(l => l.Status == "Occupied");
        var maintenance = await _context.Lockers.CountAsync(l => l.Status == "Maintenance");
        var reserved = await _context.Lockers.CountAsync(l => l.Status == "Reserved");

        // Calculate needed lockers for 400 employees
        const int totalEmployees = 400;
        var neededLockers = Math.Max(0, totalEmployees - total);

        return Ok(new { total, available, occupied, maintenance, reserved, neededLockers });
    }

    [HttpPost("{id}/assign")]
    public async Task<IActionResult> AssignLocker(int id, [FromBody] AssignLockerRequest request)
    {
        var locker = await _context.Lockers.FindAsync(id);
        if (locker == null)
            return NotFound();

        locker.AssignedTo = request.EmployeeId;
        locker.Status = "Occupied";

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("{id}/biometric")]
    public async Task<IActionResult> ToggleBiometric(int id)
    {
        var locker = await _context.Lockers.FindAsync(id);
        if (locker == null)
            return NotFound();

        locker.BiometricEnabled = !locker.BiometricEnabled;
        if (locker.BiometricEnabled && locker.LockType != "Biometric")
        {
            locker.LockType = "Biometric";
        }

        await _context.SaveChangesAsync();
        return Ok(new { biometricEnabled = locker.BiometricEnabled });
    }
}

public class AssignLockerRequest
{
    public int EmployeeId { get; set; }
}