using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InventoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetAll()
    {
        return await _context.InventoryItems.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItem>> GetById(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return NotFound();
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItem>> Create(InventoryItem item)
    {
        item.LastUpdated = DateTime.UtcNow;
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, InventoryItem item)
    {
        if (id != item.Id)
            return BadRequest();

        item.LastUpdated = DateTime.UtcNow;
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return NotFound();

        _context.InventoryItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.InventoryItems.CountAsync();
        var lowStock = await _context.InventoryItems.CountAsync(i => i.Quantity <= i.MinStock);
        var categories = await _context.InventoryItems.Select(i => i.Category).Distinct().CountAsync();

        return Ok(new { total, lowStock, categories });
    }

    [HttpGet("purchase-vs-consumption")]
    public async Task<ActionResult<object>> GetPurchaseVsConsumption()
    {
        // Get last 6 months of data
        var data = await _context.InventoryItems
            .GroupBy(i => i.LastUpdated.Month)
            .Select(g => new
            {
                Month = g.Key,
                Purchase = g.Sum(i => i.PurchasePrice * i.Quantity),
                Consumption = g.Sum(i => i.Consumption)
            })
            .OrderBy(d => d.Month)
            .Take(6)
            .ToListAsync();

        var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

        var result = data.Select(d => new
        {
            month = monthNames[d.Month - 1],
            purchase = d.Purchase,
            consumption = d.Consumption
        });

        return Ok(result);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetLowStock()
    {
        var items = await _context.InventoryItems
            .Where(i => i.Quantity <= i.MinStock)
            .ToListAsync();
        return Ok(items);
    }
}