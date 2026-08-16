using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        return await _context.Users.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();
        return user;
    }

    [HttpPost]
    public async Task<ActionResult<User>> Create(User user)
    {
        // Validate password
        if (string.IsNullOrEmpty(user.Password) || user.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters" });
        }

        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == user.Email);
        if (existingUser != null)
        {
            return BadRequest(new { message = "Email already exists" });
        }

        user.CreatedAt = DateTime.UtcNow;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, User user)
    {
        if (id != user.Id)
            return BadRequest();

        _context.Entry(user).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Users.CountAsync();
        var active = await _context.Users.CountAsync(u => u.Status == "Active");
        var inactive = await _context.Users.CountAsync(u => u.Status != "Active");
        var admins = await _context.Users.CountAsync(u => u.Role == "Admin");

        return Ok(new { total, active, inactive, admins });
    }
}