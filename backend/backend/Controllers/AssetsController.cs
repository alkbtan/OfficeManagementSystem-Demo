using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AssetsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asset>>> GetAll()
    {
        return await _context.Assets.ToListAsync();
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
    public async Task<ActionResult<Asset>> Create(Asset asset)
    {
        asset.CreatedAt = DateTime.UtcNow;
        asset.PurchaseDate = asset.PurchaseDate.ToUniversalTime();
        if (asset.WarrantyExpiry.HasValue)
        {
            asset.WarrantyExpiry = asset.WarrantyExpiry.Value.ToUniversalTime();
        }
        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();
        return Ok(asset);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Asset asset)
    {
        if (id != asset.Id)
            return BadRequest();

        _context.Entry(asset).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(asset);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var asset = await _context.Assets.FindAsync(id);
        if (asset == null)
            return NotFound();

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Assets.CountAsync();
        var available = await _context.Assets.CountAsync(a => a.Status == "Available");
        var inUse = await _context.Assets.CountAsync(a => a.Status == "In Use");
        var maintenance = await _context.Assets.CountAsync(a => a.Status == "Maintenance");

        return Ok(new { total, available, inUse, maintenance });
    }
}