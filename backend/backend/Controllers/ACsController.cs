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
public class ACsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ACsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AirConditioner>>> GetAll()
    {
        return await _context.AirConditioners
            .Include(a => a.Issues)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AirConditioner>> GetById(int id)
    {
        var ac = await _context.AirConditioners
            .Include(a => a.Issues)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (ac == null)
            return NotFound();
        return ac;
    }

    [HttpPost]
    public async Task<ActionResult<AirConditioner>> Create(AirConditioner ac)
    {
        ac.CreatedBy = CurrentUsername;
        ac.CreatedAt = DateTime.UtcNow;
        ac.LastMaintenance = DateTime.UtcNow;
        ac.InstallationDate = ac.InstallationDate.ToUniversalTime();
        _context.AirConditioners.Add(ac);
        await _context.SaveChangesAsync();
        return Ok(ac);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AirConditioner ac)
    {
        var existing = await _context.AirConditioners.FindAsync(id);
        if (existing == null)
            return NotFound();

        if (!CanDeleteAny && existing.CreatedBy != CurrentUsername)
            return Forbid();

        if (id != ac.Id)
            return BadRequest();

        existing.Name = ac.Name;
        existing.Location = ac.Location;
        existing.Brand = ac.Brand;
        existing.Model = ac.Model ?? string.Empty;
        existing.Capacity = ac.Capacity;
        existing.Status = ac.Status;
        existing.InstallationDate = ac.InstallationDate;
        existing.LastMaintenance = ac.LastMaintenance;
        existing.TotalMaintenanceCost = ac.TotalMaintenanceCost;
        existing.MaintenanceCount = ac.MaintenanceCount;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ac = await _context.AirConditioners.FindAsync(id);
        if (ac == null)
            return NotFound();

        if (!CanDeleteAny && ac.CreatedBy != CurrentUsername)
            return Forbid();

        _context.AirConditioners.Remove(ac);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.AirConditioners.CountAsync();
        var operational = await _context.AirConditioners.CountAsync(a => a.Status == "Operational");
        var underMaintenance = await _context.AirConditioners.CountAsync(a => a.Status == "Under Maintenance");
        var faulty = await _context.AirConditioners.CountAsync(a => a.Status == "Faulty");
        var totalMaintenanceCost = await _context.AirConditioners.SumAsync(a => a.TotalMaintenanceCost);

        return Ok(new { total, operational, underMaintenance, faulty, totalMaintenanceCost });
    }

    [HttpGet("{id}/issues")]
    public async Task<ActionResult<IEnumerable<ACIssue>>> GetIssues(int id)
    {
        var issues = await _context.ACIssues
            .Where(i => i.AirConditionerId == id)
            .ToListAsync();
        return Ok(issues);
    }

    [HttpPost("{id}/issues")]
    public async Task<ActionResult<ACIssue>> AddIssue(int id, ACIssue issue)
    {
        var ac = await _context.AirConditioners.FindAsync(id);
        if (ac == null)
            return NotFound();

        issue.AirConditionerId = id;
        issue.ReportedDate = DateTime.UtcNow;
        issue.Status = "Open";

        _context.ACIssues.Add(issue);

        ac.Status = "Under Maintenance";
        ac.MaintenanceCount += 1;

        await _context.SaveChangesAsync();
        return Ok(issue);
    }

    [HttpPut("issues/{issueId}")]
    public async Task<IActionResult> ResolveIssue(int issueId)
    {
        var issue = await _context.ACIssues.FindAsync(issueId);
        if (issue == null)
            return NotFound();

        issue.Status = "Resolved";
        issue.ResolvedDate = DateTime.UtcNow;

        var hasOpenIssues = await _context.ACIssues
            .AnyAsync(i => i.AirConditionerId == issue.AirConditionerId && i.Status != "Resolved");

        if (!hasOpenIssues)
        {
            var ac = await _context.AirConditioners.FindAsync(issue.AirConditionerId);
            if (ac != null)
            {
                ac.Status = "Operational";
                ac.LastMaintenance = DateTime.UtcNow;
                ac.TotalMaintenanceCost += issue.Cost;
            }
        }

        await _context.SaveChangesAsync();
        return Ok();
    }
}