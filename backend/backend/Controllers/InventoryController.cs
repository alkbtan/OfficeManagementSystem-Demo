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

    // GET: api/Inventory
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetAll()
    {
        var items = await _context.InventoryItems
            .OrderBy(i => i.Name)
            .ToListAsync();

        // ✅ Recalculate status for each item before returning
        foreach (var item in items)
        {
            UpdateStatus(item);
        }

        return items;
    }

    // GET: api/Inventory/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItem>> GetById(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return NotFound();

        // ✅ Recalculate status
        UpdateStatus(item);

        return item;
    }

    // POST: api/Inventory
    [HttpPost]
    public async Task<ActionResult<InventoryItem>> Create([FromBody] InventoryItem item)
    {
        if (string.IsNullOrWhiteSpace(item.Name))
            return BadRequest(new { message = "Item Name is required" });

        if (string.IsNullOrWhiteSpace(item.Category))
            return BadRequest(new { message = "Category is required" });

        // ✅ Update status based on quantity and minStock
        UpdateStatus(item);

        item.LastUpdated = DateTime.UtcNow;
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item);
    }

    // PUT: api/Inventory/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] InventoryItem item)
    {
        var existingItem = await _context.InventoryItems.FindAsync(id);
        if (existingItem == null)
            return NotFound(new { message = "Inventory item not found" });

        if (string.IsNullOrWhiteSpace(item.Name))
            return BadRequest(new { message = "Item Name is required" });

        if (string.IsNullOrWhiteSpace(item.Category))
            return BadRequest(new { message = "Category is required" });

        // ✅ Update all fields
        existingItem.Name = item.Name;
        existingItem.Category = item.Category;
        existingItem.Quantity = item.Quantity;
        existingItem.MinStock = item.MinStock;
        existingItem.Unit = item.Unit ?? string.Empty;
        existingItem.Supplier = item.Supplier ?? string.Empty;
        existingItem.PurchaseDate = item.PurchaseDate;

        // ✅ Update status based on quantity and minStock
        UpdateStatus(existingItem);

        existingItem.LastUpdated = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        
        return Ok(existingItem);
    }

    // DELETE: api/Inventory/{id}
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

    // GET: api/Inventory/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var items = await _context.InventoryItems.ToListAsync();
        
        // ✅ Update status for all items first
        foreach (var item in items)
        {
            UpdateStatus(item);
        }
        await _context.SaveChangesAsync();

        var total = items.Count;
        var lowStock = items.Count(i => i.Status == "Low Stock");
        var outOfStock = items.Count(i => i.Status == "Out of Stock");
        var categories = items.Select(i => i.Category).Distinct().Count();

        return Ok(new { total, lowStock, outOfStock, categories });
    }

    // GET: api/Inventory/low-stock
    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetLowStock()
    {
        var items = await _context.InventoryItems.ToListAsync();
        
        // ✅ Update status for all items first
        foreach (var item in items)
        {
            UpdateStatus(item);
        }
        await _context.SaveChangesAsync();

        return await _context.InventoryItems
            .Where(i => i.Status == "Low Stock" || i.Status == "Out of Stock")
            .OrderBy(i => i.Name)
            .ToListAsync();
    }

    // ✅ Helper method to update status
    private void UpdateStatus(InventoryItem item)
    {
        if (item.Quantity <= 0)
        {
            item.Status = "Out of Stock";
        }
        else if (item.Quantity < item.MinStock)
        {
            item.Status = "Low Stock";
        }
        else
        {
            item.Status = "In Stock";
        }
    }
}