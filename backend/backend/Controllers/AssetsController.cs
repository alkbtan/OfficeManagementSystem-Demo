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
public class AssetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AssetsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asset>>> GetAll()
    {
        return await _context.Assets
            .OrderBy(a => a.Name)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Asset>> GetById(int id)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            return NotFound();
        return asset;
    }

    [HttpPost]
    public async Task<ActionResult<Asset>> Create([FromBody] Asset asset)
    {
        if (string.IsNullOrWhiteSpace(asset.Name))
            return BadRequest(new { message = "Name is required" });

        if (string.IsNullOrWhiteSpace(asset.Type))
            return BadRequest(new { message = "Type is required" });

        asset.CreatedBy = CurrentUsername;
        asset.CreatedAt = DateTime.UtcNow;
        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();
        return Ok(asset);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Asset asset)
    {
        var existingAsset = await _context.Assets.FindAsync(id);
        if (existingAsset == null)
            return NotFound(new { message = "Asset not found" });

        if (!CanDeleteAny && existingAsset.CreatedBy != CurrentUsername)
            return Forbid();

        if (string.IsNullOrWhiteSpace(asset.Name))
            return BadRequest(new { message = "Name is required" });

        if (string.IsNullOrWhiteSpace(asset.Type))
            return BadRequest(new { message = "Type is required" });

        existingAsset.Name = asset.Name;
        existingAsset.Type = asset.Type;
        existingAsset.Model = asset.Model ?? string.Empty;
        existingAsset.SerialNumber = asset.SerialNumber ?? string.Empty;
        existingAsset.Status = asset.Status;
        existingAsset.AssignedTo = asset.AssignedTo;
        existingAsset.Location = asset.Location;

        await _context.SaveChangesAsync();
        return Ok(existingAsset);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            return NotFound();

        if (!CanDeleteAny && asset.CreatedBy != CurrentUsername)
            return Forbid();

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<Asset>>> GetAvailable()
    {
        return await _context.Assets
            .Where(a => a.Status == "Available")
            .ToListAsync();
    }
}