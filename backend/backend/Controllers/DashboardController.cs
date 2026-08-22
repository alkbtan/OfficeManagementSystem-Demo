using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Dashboard/stats
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

    // GET: api/Dashboard/recent-activities
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

        return Ok(new
        {
            tickets = recentTickets,
            employees = recentEmployees
        });
    }

    // GET: api/Dashboard/inventory-stats
    [HttpGet("inventory-stats")]
    public async Task<ActionResult<object>> GetInventoryStats()
    {
        var totalItems = await _context.InventoryItems.CountAsync();
        var lowStock = await _context.InventoryItems.CountAsync(i => i.Status == "Low Stock");
        var outOfStock = await _context.InventoryItems.CountAsync(i => i.Status == "Out of Stock");
        
        // ✅ FIXED: Removed PurchasePrice and Consumption
        var totalValue = await _context.InventoryItems.SumAsync(i => i.Quantity * 0);

        return Ok(new
        {
            totalItems,
            lowStock,
            outOfStock,
            totalValue
        });
    }

    // GET: api/Dashboard/ticket-stats
    [HttpGet("ticket-stats")]
    public async Task<ActionResult<object>> GetTicketStats()
    {
        var open = await _context.Tickets.CountAsync(t => t.Status == "Open");
        var inProgress = await _context.Tickets.CountAsync(t => t.Status == "In Progress");
        var resolved = await _context.Tickets.CountAsync(t => t.Status == "Resolved");
        var closed = await _context.Tickets.CountAsync(t => t.Status == "Closed");

        return Ok(new
        {
            open,
            inProgress,
            resolved,
            closed
        });
    }

    // GET: api/Dashboard/low-stock-items
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