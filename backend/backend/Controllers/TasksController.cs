using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TasksController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Tasks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoTask>>> GetAll()
    {
        return await _context.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Tasks/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TodoTask>> GetById(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();
        return task;
    }

    // POST: api/Tasks
    [HttpPost]
    public async Task<ActionResult<TodoTask>> Create([FromBody] TodoTask task)
    {
        if (string.IsNullOrWhiteSpace(task.Title))
            return BadRequest(new { message = "Title is required" });

        if (task.DueDate.Kind != DateTimeKind.Utc)
        {
            task.DueDate = DateTime.SpecifyKind(task.DueDate, DateTimeKind.Utc);
        }

        task.CreatedAt = DateTime.UtcNow;
        task.Completed = false;

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return Ok(task);
    }

    // PUT: api/Tasks/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] TodoTask task)
    {
        var existingTask = await _context.Tasks.FindAsync(id);
        if (existingTask == null)
            return NotFound(new { message = "Task not found" });

        if (string.IsNullOrWhiteSpace(task.Title))
            return BadRequest(new { message = "Title is required" });

        var wasCompleted = existingTask.Completed;

        existingTask.Title = task.Title;
        existingTask.Description = task.Description ?? string.Empty;
        existingTask.Priority = task.Priority ?? "Medium";
        existingTask.Category = task.Category ?? "Work";
        existingTask.DueDate = task.DueDate.Kind == DateTimeKind.Utc
            ? task.DueDate
            : DateTime.SpecifyKind(task.DueDate, DateTimeKind.Utc);
        existingTask.Completed = task.Completed;

        // Set/clear CompletedAt
        if (task.Completed && !wasCompleted)
        {
            existingTask.CompletedAt = DateTime.UtcNow;
        }
        else if (!task.Completed)
        {
            existingTask.CompletedAt = null;
        }

        await _context.SaveChangesAsync();
        return Ok(existingTask);
    }

    // PUT: api/Tasks/{id}/toggle
    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleComplete(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        task.Completed = !task.Completed;
        task.CompletedAt = task.Completed ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync();
        return Ok(task);
    }

    // DELETE: api/Tasks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET: api/Tasks/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Tasks.CountAsync();
        var completed = await _context.Tasks.CountAsync(t => t.Completed);
        var pending = total - completed;
        var urgent = await _context.Tasks.CountAsync(t => t.Category == "Urgent" && !t.Completed);
        var high = await _context.Tasks.CountAsync(t => t.Priority == "High" && !t.Completed);

        return Ok(new { total, completed, pending, urgent, high });
    }
}