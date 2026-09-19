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
public class InventoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InventoryController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetAll()
    {
        var items = await _context.InventoryItems
            .OrderBy(i => i.Name)
            .ToListAsync();

        foreach (var item in items)
            UpdateStatus(item);

        return items;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItem>> GetById(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return NotFound();

        UpdateStatus(item);
        return item;
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItem>> Create([FromBody] InventoryItem item)
    {
        if (string.IsNullOrWhiteSpace(item.Name))
            return BadRequest(new { message = "Item Name is required" });

        if (string.IsNullOrWhiteSpace(item.Category))
            return BadRequest(new { message = "Category is required" });

        UpdateStatus(item);

        item.CreatedBy = CurrentUsername;
        item.LastUpdated = DateTime.UtcNow;
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] InventoryItem item)
    {
        var existingItem = await _context.InventoryItems.FindAsync(id);
        if (existingItem == null)
            return NotFound(new { message = "Inventory item not found" });

        if (!CanDeleteAny && existingItem.CreatedBy != CurrentUsername)
            return Forbid();

        if (string.IsNullOrWhiteSpace(item.Name))
            return BadRequest(new { message = "Item Name is required" });

        if (string.IsNullOrWhiteSpace(item.Category))
            return BadRequest(new { message = "Category is required" });

        existingItem.Name = item.Name;
        existingItem.Category = item.Category;
        existingItem.Quantity = item.Quantity;
        existingItem.MinStock = item.MinStock;
        existingItem.Unit = item.Unit ?? string.Empty;
        existingItem.Supplier = item.Supplier ?? string.Empty;
        existingItem.PurchaseDate = item.PurchaseDate;

        UpdateStatus(existingItem);
        existingItem.LastUpdated = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(existingItem);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return NotFound();

        if (!CanDeleteAny && item.CreatedBy != CurrentUsername)
            return Forbid();

        _context.InventoryItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var items = await _context.InventoryItems.ToListAsync();

        foreach (var item in items)
            UpdateStatus(item);

        await _context.SaveChangesAsync();

        var total = items.Count;
        var lowStock = items.Count(i => i.Status == "Low Stock");
        var outOfStock = items.Count(i => i.Status == "Out of Stock");
        var categories = items.Select(i => i.Category).Distinct().Count();

        return Ok(new { total, lowStock, outOfStock, categories });
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<InventoryItem>>> GetLowStock()
    {
        var items = await _context.InventoryItems.ToListAsync();

        foreach (var item in items)
            UpdateStatus(item);

        await _context.SaveChangesAsync();

        return await _context.InventoryItems
            .Where(i => i.Status == "Low Stock" || i.Status == "Out of Stock")
            .OrderBy(i => i.Name)
            .ToListAsync();
    }

    private void UpdateStatus(InventoryItem item)
    {
        if (item.Quantity <= 0)
            item.Status = "Out of Stock";
        else if (item.Quantity < item.MinStock)
            item.Status = "Low Stock";
        else
            item.Status = "In Stock";
    }
}