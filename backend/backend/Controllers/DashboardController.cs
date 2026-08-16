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

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var totalEmployees = await _context.Employees.CountAsync();
        var departments = await _context.Employees.Select(e => e.Department).Distinct().CountAsync();
        var activeEmployees = await _context.Employees.CountAsync(e => e.Status == "Active");
        var inactiveEmployees = await _context.Employees.CountAsync(e => e.Status != "Active");
        
        var openTickets = await _context.Tickets.CountAsync(t => t.Status == "Open");
        var purchaseRequests = await _context.ProcurementRequests.CountAsync(p => p.Status == "Pending");
        var totalBudget = await _context.Budgets.SumAsync(b => b.Planned);
        var spentBudget = await _context.Budgets.SumAsync(b => b.Spent);
        
        var pendingMaintenance = await _context.Tickets.CountAsync(t => t.Status != "Closed");
        var acUnits = await _context.AirConditioners.CountAsync();
        var totalLockers = await _context.Lockers.CountAsync();
        var occupiedLockers = await _context.Lockers.CountAsync(l => l.Status == "Occupied");
        var inventoryItems = await _context.InventoryItems.CountAsync();
        
        var totalEmployeesCount = 400; // يمكنك جلبها من قاعدة البيانات

        return Ok(new
        {
            totalEmployees,
            departments,
            activeEmployees,
            inactiveEmployees,
            openTickets,
            purchaseRequests,
            totalBudget,
            spentBudget,
            remainingBudget = totalBudget - spentBudget,
            pendingMaintenance,
            acUnits,
            totalLockers,
            occupiedLockers,
            availableLockers = totalLockers - occupiedLockers,
            neededLockers = Math.Max(0, totalEmployeesCount - totalLockers),
            inventoryItems,
            totalEmployeesCount,
            budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0
        });
    }

    [HttpGet("expenses")]
    public async Task<ActionResult<object>> GetMonthlyExpenses()
    {
        var expenses = await _context.Budgets
            .GroupBy(b => new { b.Year, b.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalSpent = g.Sum(b => b.Spent)
            })
            .OrderBy(e => e.Year)
            .ThenBy(e => e.Month)
            .Take(6)
            .ToListAsync();

        var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

        var result = expenses.Select(e => new
        {
            month = monthNames[e.Month - 1],
            amount = e.TotalSpent
        });

        return Ok(result);
    }

    [HttpGet("purchase-vs-consumption")]
    public async Task<ActionResult<object>> GetPurchaseVsConsumption()
    {
        // Get last 6 months
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

    [HttpGet("maintenance-costs")]
    public async Task<ActionResult<object>> GetMaintenanceCosts()
    {
        // Group tickets by type to get maintenance costs
        var costs = await _context.Tickets
            .GroupBy(t => t.Priority)
            .Select(g => new
            {
                Name = g.Key == "High" ? "AC" :
                       g.Key == "Medium" ? "Plumbing" :
                       g.Key == "Low" ? "Electrical" : "Other",
                Cost = g.Count() * 1000 // Mock cost calculation
            })
            .ToListAsync();

        return Ok(costs);
    }

    [HttpGet("supplier-performance")]
    public async Task<ActionResult<object>> GetSupplierPerformance()
    {
        // Mock supplier data
        var suppliers = new[]
        {
            new { name = "ABC Company", score = 92 },
            new { name = "TechCool", score = 85 },
            new { name = "OfficePro", score = 78 },
            new { name = "CleanCo", score = 70 },
            new { name = "BuildIt", score = 65 }
        };

        return Ok(suppliers);
    }

    [HttpGet("office-requests")]
    public async Task<ActionResult<object>> GetOfficeRequests()
    {
        var requests = await _context.Requests
            .GroupBy(r => r.Type)
            .Select(g => new
            {
                name = g.Key,
                value = g.Count()
            })
            .ToListAsync();

        return Ok(requests);
    }
}