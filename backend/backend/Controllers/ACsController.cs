using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ACsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ACsController(ApplicationDbContext context)
    {
        _context = context;
    }

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
        if (id != ac.Id)
            return BadRequest();

        _context.Entry(ac).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(ac);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ac = await _context.AirConditioners.FindAsync(id);
        if (ac == null)
            return NotFound();

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

        // Update AC status
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

        // Update AC status if no other open issues
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