using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AirConditionersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AirConditionersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/AirConditioners
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AirConditioner>>> GetAll()
    {
        return await _context.AirConditioners
            .Include(a => a.Issues)
            .OrderBy(a => a.Name)
            .ToListAsync();
    }

    // GET: api/AirConditioners/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<AirConditioner>> GetById(int id)
    {
        var unit = await _context.AirConditioners
            .Include(a => a.Issues)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (unit == null)
            return NotFound();

        return unit;
    }

    // POST: api/AirConditioners
    [HttpPost]
    public async Task<ActionResult<AirConditioner>> Create([FromBody] AirConditioner unit)
    {
        if (string.IsNullOrWhiteSpace(unit.Name))
            return BadRequest(new { message = "Name is required" });

        if (string.IsNullOrWhiteSpace(unit.Location))
            return BadRequest(new { message = "Location is required" });

        if (string.IsNullOrWhiteSpace(unit.Brand))
            return BadRequest(new { message = "Brand is required" });

        unit.CreatedAt = DateTime.UtcNow;
        _context.AirConditioners.Add(unit);
        await _context.SaveChangesAsync();

        return Ok(unit);
    }

    // PUT: api/AirConditioners/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] AirConditioner unit)
    {
        // Check if unit exists
        var existingUnit = await _context.AirConditioners.FindAsync(id);
        if (existingUnit == null)
            return NotFound(new { message = "AC unit not found" });

        // Validate required fields
        if (string.IsNullOrWhiteSpace(unit.Name))
            return BadRequest(new { message = "Name is required" });

        if (string.IsNullOrWhiteSpace(unit.Location))
            return BadRequest(new { message = "Location is required" });

        if (string.IsNullOrWhiteSpace(unit.Brand))
            return BadRequest(new { message = "Brand is required" });

        // Update fields
        existingUnit.Name = unit.Name;
        existingUnit.Location = unit.Location;
        existingUnit.Brand = unit.Brand;
        existingUnit.Model = unit.Model ?? string.Empty;
        existingUnit.Capacity = unit.Capacity;
        existingUnit.Status = unit.Status;
        existingUnit.InstallationDate = unit.InstallationDate;
        existingUnit.LastMaintenance = unit.LastMaintenance;
        existingUnit.TotalMaintenanceCost = unit.TotalMaintenanceCost;
        existingUnit.MaintenanceCount = unit.MaintenanceCount;

        await _context.SaveChangesAsync();

        return Ok(existingUnit);
    }

    // DELETE: api/AirConditioners/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var unit = await _context.AirConditioners.FindAsync(id);
        if (unit == null)
            return NotFound();

        _context.AirConditioners.Remove(unit);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/AirConditioners/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.AirConditioners.CountAsync();
        var operational = await _context.AirConditioners.CountAsync(a => a.Status == "Operational");
        var maintenance = await _context.AirConditioners.CountAsync(a => a.Status == "Under Maintenance");
        var totalCost = await _context.AirConditioners.SumAsync(a => a.TotalMaintenanceCost);

        return Ok(new
        {
            total,
            operational,
            maintenance,
            totalCost
        });
    }
}