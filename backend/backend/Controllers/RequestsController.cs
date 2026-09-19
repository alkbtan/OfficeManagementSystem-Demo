using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RequestsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Request>>> GetAll()
    {
        return await _context.Requests.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Request>> GetById(int id)
    {
        var request = await _context.Requests.FindAsync(id);
        if (request == null)
            return NotFound();
        return request;
    }

    [HttpPost]
    public async Task<ActionResult<Request>> Create(Request request)
    {
        request.CreatedAt = DateTime.UtcNow;
        request.Date = DateTime.UtcNow;
        _context.Requests.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Request request)
    {
        if (id != request.Id)
            return BadRequest();

        _context.Entry(request).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var request = await _context.Requests.FindAsync(id);
        if (request == null)
            return NotFound();

        _context.Requests.Remove(request);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Requests.CountAsync();
        var pending = await _context.Requests.CountAsync(r => r.Status == "Pending");
        var approved = await _context.Requests.CountAsync(r => r.Status == "Approved");
        var rejected = await _context.Requests.CountAsync(r => r.Status == "Rejected");

        return Ok(new { total, pending, approved, rejected });
    }
}