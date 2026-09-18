using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BudgetController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Budget>>> GetAll()
    {
        return await _context.Budgets.OrderByDescending(b => b.Year).ThenByDescending(b => b.Month).ToListAsync();
    }

    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetSummary()
    {
        var planned = await _context.Budgets.SumAsync(b => b.Planned);
        var spent = await _context.Budgets.SumAsync(b => b.Spent);
        var categories = await _context.Budgets
            .GroupBy(b => b.Category)
            .Select(g => new
            {
                category = g.Key,
                planned = g.Sum(b => b.Planned),
                spent = g.Sum(b => b.Spent)
            })
            .ToListAsync();

        return Ok(new
        {
            planned,
            spent,
            remaining = planned - spent,
            categories
        });
    }

    [HttpPost]
    public async Task<ActionResult<Budget>> Create(Budget budget)
    {
        budget.CreatedAt = DateTime.UtcNow;
        budget.UpdatedAt = DateTime.UtcNow;
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();
        return Ok(budget);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Budget budget)
    {
        var existing = await _context.Budgets.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.Category = budget.Category;
        existing.Planned = budget.Planned;
        existing.Spent = budget.Spent;
        existing.Year = budget.Year;
        existing.Month = budget.Month;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var budget = await _context.Budgets.FindAsync(id);
        if (budget == null)
            return NotFound();

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
