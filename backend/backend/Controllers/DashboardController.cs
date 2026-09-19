using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;

namespace OfficeManagementAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var employeeCount = await _context.Employees.CountAsync();
        var assetCount = await _context.Assets.CountAsync();
        var ticketCount = await _context.Tickets.CountAsync();
        var lockerCount = await _context.Lockers.CountAsync();
        var acCount = await _context.AirConditioners.CountAsync();
        var inventoryCount = await _context.InventoryItems.CountAsync();

        return Ok(new
        {
            employees = employeeCount,
            assets = assetCount,
            tickets = ticketCount,
            lockers = lockerCount,
            acUnits = acCount,
            inventory = inventoryCount
        });
    }

    [HttpGet("recent-activities")]
    public async Task<ActionResult<object>> GetRecentActivities()
    {
        var recentTickets = await _context.Tickets
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .Select(t => new { t.Id, t.Title, t.Status, t.CreatedAt })
            .ToListAsync();

        var recentEmployees = await _context.Employees
            .OrderByDescending(e => e.CreatedAt)
            .Take(5)
            .Select(e => new { e.Id, Name = e.FirstName + " " + e.LastName, e.Department, e.CreatedAt })
            .ToListAsync();

        return Ok(new { tickets = recentTickets, employees = recentEmployees });
    }

    [HttpGet("inventory-stats")]
    public async Task<ActionResult<object>> GetInventoryStats()
    {
        var items = await _context.InventoryItems.ToListAsync();

        foreach (var item in items)
        {
            if (item.Quantity <= 0)
                item.Status = "Out of Stock";
            else if (item.Quantity < item.MinStock)
                item.Status = "Low Stock";
            else
                item.Status = "In Stock";
        }

        await _context.SaveChangesAsync();

        var totalItems = items.Count;
        var lowStock = items.Count(i => i.Status == "Low Stock");
        var outOfStock = items.Count(i => i.Status == "Out of Stock");

        return Ok(new { totalItems, lowStock, outOfStock });
    }

    [HttpGet("ticket-stats")]
    public async Task<ActionResult<object>> GetTicketStats()
    {
        var open = await _context.Tickets.CountAsync(t => t.Status == "Open");
        var inProgress = await _context.Tickets.CountAsync(t => t.Status == "In Progress");
        var resolved = await _context.Tickets.CountAsync(t => t.Status == "Resolved");
        var closed = await _context.Tickets.CountAsync(t => t.Status == "Closed");

        return Ok(new { open, inProgress, resolved, closed });
    }

    [HttpGet("low-stock-items")]
    public async Task<ActionResult<object>> GetLowStockItems()
    {
        var items = await _context.InventoryItems
            .Where(i => i.Status == "Low Stock" || i.Status == "Out of Stock")
            .Select(i => new { i.Id, i.Name, i.Quantity, i.MinStock, i.Status })
            .Take(5)
            .ToListAsync();

        return Ok(items);
    }
}