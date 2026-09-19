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
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Helper: current user info
    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private int CurrentUserId => int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : 0;

    // GET: api/Users — Admin, Manager only
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        var users = await _context.Users
            .OrderBy(u => u.Username)
            .ToListAsync();

        foreach (var user in users)
            user.Password = "";

        return Ok(users);
    }

    // GET: api/Users/{id} — Admin, Manager, or Self
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        // User can only view own profile
        if (CurrentRole == "User" && user.Username != CurrentUsername)
            return Forbid();

        user.Password = "";
        return Ok(user);
    }

    // POST: api/Users — Admin only
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<User>> Create([FromBody] User user)
    {
        if (string.IsNullOrWhiteSpace(user.Username))
            return BadRequest(new { message = "Username is required" });

        if (string.IsNullOrWhiteSpace(user.Name))
            user.Name = user.Username;

        if (string.IsNullOrWhiteSpace(user.Email))
            return BadRequest(new { message = "Email is required" });

        if (string.IsNullOrWhiteSpace(user.Password))
            return BadRequest(new { message = "Password is required" });

        var existingUsername = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == user.Username);
        if (existingUsername != null)
            return BadRequest(new { message = "Username already exists" });

        var existingEmail = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == user.Email);
        if (existingEmail != null)
            return BadRequest(new { message = "Email already exists" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        user.CreatedAt = DateTime.UtcNow;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        user.Password = "";
        return Ok(user);
    }

    // PUT: api/Users/{id} — Admin, Manager, or Self
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] User user)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
            return NotFound(new { message = "User not found" });

        // ─────────────────────────────────────────────────────
        // Permission checks
        // ─────────────────────────────────────────────────────
        var isSelf = existingUser.Username == CurrentUsername;

        // User: can only edit self
        if (CurrentRole == "User" && !isSelf)
            return Forbid();

        // Manager: can't edit Admins
        if (CurrentRole == "Manager" && existingUser.Role == "Admin" && !isSelf)
            return Forbid();

        // Manager & User: can't change roles
        if (CurrentRole != "Admin" && user.Role != existingUser.Role)
            return Forbid();

        // Manager & User: can't change status
        if (CurrentRole != "Admin" && user.Status != existingUser.Status)
            return Forbid();

        // Manager & User: can't change email of others (only self)
        if (CurrentRole == "User" && !isSelf)
            return Forbid();

        // ─────────────────────────────────────────────────────
        // Validations
        // ─────────────────────────────────────────────────────
        if (string.IsNullOrWhiteSpace(user.Username))
            return BadRequest(new { message = "Username is required" });

        if (string.IsNullOrWhiteSpace(user.Email))
            return BadRequest(new { message = "Email is required" });

        var duplicateUsername = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == user.Username && u.Id != id);
        if (duplicateUsername != null)
            return BadRequest(new { message = "Username already exists" });

        var duplicateEmail = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == user.Email && u.Id != id);
        if (duplicateEmail != null)
            return BadRequest(new { message = "Email already exists" });

        // ─────────────────────────────────────────────────────
        // Apply updates
        // ─────────────────────────────────────────────────────
        existingUser.Username = user.Username;
        existingUser.Name = string.IsNullOrWhiteSpace(user.Name) ? user.Username : user.Name;
        existingUser.Email = user.Email;

        // Only Admin can change Role
        if (CurrentRole == "Admin")
        {
            existingUser.Role = user.Role;
            existingUser.Status = user.Status;
        }

        // Password: if provided and allowed
        if (!string.IsNullOrWhiteSpace(user.Password))
        {
            existingUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        }

        await _context.SaveChangesAsync();

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

        var isSelf = user.Username == CurrentUsername;

        // User: can only reset own password
        if (CurrentRole == "User" && !isSelf)
            return Forbid();

        // Manager: can't reset Admin password
        if (CurrentRole == "Manager" && user.Role == "Admin" && !isSelf)
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "New password is required" });

        if (request.NewPassword.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully" });
    }

    // DELETE: api/Users/{id} — Admin only
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        // Prevent admin from deleting self
        if (user.Username == CurrentUsername)
            return BadRequest(new { message = "You cannot delete your own account" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class ResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}