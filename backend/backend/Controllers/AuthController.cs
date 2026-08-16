using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using OfficeManagementAPI.Data;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Search for user in database
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        // Check if user exists and password matches
        if (user != null && user.Password == request.Password)
        {
            var token = GenerateJwtToken(user.Email);
            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    role = user.Role
                }
            });
        }

        // Fallback: Check hardcoded admin
        if (request.Email == "admin@example.com" && request.Password == "admin123")
        {
            var token = GenerateJwtToken(request.Email);
            return Ok(new
            {
                token,
                user = new
                {
                    id = 1,
                    name = "Admin",
                    email = request.Email,
                    role = "Admin"
                }
            });
        }

        return Unauthorized(new { message = "Invalid email or password" });
    }

    private string GenerateJwtToken(string email)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecretKeyHere1234567890!@#$%"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var token = new JwtSecurityToken(
            issuer: "OfficeManagementAPI",
            audience: "OfficeManagementAPI",
            claims: claims,
            expires: DateTime.Now.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}