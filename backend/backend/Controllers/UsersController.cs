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

    // GET: api/Users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        return await _context.Users
            .OrderBy(u => u.Name)
            .ToListAsync();
    }

    // GET: api/Users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();
        return user;
    }

    // POST: api/Users
    [HttpPost]
    public async Task<ActionResult<User>> Create([FromBody] User user)
    {
        if (string.IsNullOrWhiteSpace(user.Name))
            return BadRequest(new { message = "Name is required" });

        if (string.IsNullOrWhiteSpace(user.Email))
            return BadRequest(new { message = "Email is required" });

        if (string.IsNullOrWhiteSpace(user.Password))
            return BadRequest(new { message = "Password is required" });

        // Check if email already exists
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
        if (existing != null)
            return BadRequest(new { message = "Email already exists" });

        // Hash password
        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        user.CreatedAt = DateTime.UtcNow;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Don't return password
        user.Password = "";
        return Ok(user);
    }

    // PUT: api/Users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] User user)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
            return NotFound(new { message = "User not found" });

        if (string.IsNullOrWhiteSpace(user.Name))
            return BadRequest(new { message = "Name is required" });

        if (string.IsNullOrWhiteSpace(user.Email))
            return BadRequest(new { message = "Email is required" });

        // Check if email already exists (excluding current user)
        var existing = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == user.Email && u.Id != id);
        if (existing != null)
            return BadRequest(new { message = "Email already exists" });

        // Update fields
        existingUser.Name = user.Name;
        existingUser.Email = user.Email;
        existingUser.Role = user.Role;
        existingUser.Status = user.Status;

        // Update password if provided
        if (!string.IsNullOrWhiteSpace(user.Password))
        {
            existingUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        }

        await _context.SaveChangesAsync();

        // Don't return password
        existingUser.Password = "";
        return Ok(existingUser);
    }

    // PUT: api/Users/{id}/reset-password
    [HttpPut("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "New password is required" });

        if (request.NewPassword.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters" });

        // Hash new password
        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully" });
    }

    // DELETE: api/Users/{id}
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

    // POST: api/Users/login
    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            return Unauthorized(new { message = "Invalid email or password" });

        if (user.Status != "Active")
            return Unauthorized(new { message = "Account is inactive" });

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            return Unauthorized(new { message = "Invalid email or password" });

        // Don't return password
        user.Password = "";

        return Ok(new
        {
            user = user,
            token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
        });
    }
}

// ✅ Only keep ResetPasswordRequest
public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}

// ❌ LoginRequest is already defined in AuthController.cs - DO NOT add it here