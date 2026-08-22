using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProcurementController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProcurementController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Procurement
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProcurementRequest>>> GetAll()
    {
        return await _context.ProcurementRequests
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Procurement/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProcurementRequest>> GetById(int id)
    {
        var request = await _context.ProcurementRequests.FindAsync(id);
        if (request == null)
            return NotFound();
        return request;
    }

    // POST: api/Procurement
    [HttpPost]
    public async Task<ActionResult<ProcurementRequest>> Create([FromBody] ProcurementRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RequestNumber))
            return BadRequest(new { message = "Request Number is required" });

        if (string.IsNullOrWhiteSpace(request.Department))
            return BadRequest(new { message = "Department is required" });

        if (string.IsNullOrWhiteSpace(request.Requester))
            return BadRequest(new { message = "Requester is required" });

        if (string.IsNullOrWhiteSpace(request.Vendor))
            return BadRequest(new { message = "Vendor is required" });

        request.CreatedAt = DateTime.UtcNow;
        _context.ProcurementRequests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(request);
    }

    // PUT: api/Procurement/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProcurementRequest request)
    {
        // Check if request exists
        var existingRequest = await _context.ProcurementRequests.FindAsync(id);
        if (existingRequest == null)
            return NotFound(new { message = "Procurement request not found" });

        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.RequestNumber))
            return BadRequest(new { message = "Request Number is required" });

        if (string.IsNullOrWhiteSpace(request.Department))
            return BadRequest(new { message = "Department is required" });

        if (string.IsNullOrWhiteSpace(request.Requester))
            return BadRequest(new { message = "Requester is required" });

        if (string.IsNullOrWhiteSpace(request.Vendor))
            return BadRequest(new { message = "Vendor is required" });

        // Update fields
        existingRequest.RequestNumber = request.RequestNumber;
        existingRequest.Department = request.Department;
        existingRequest.Requester = request.Requester;
        existingRequest.Vendor = request.Vendor;
        existingRequest.Items = request.Items ?? string.Empty;
        existingRequest.TotalAmount = request.TotalAmount;
        existingRequest.Status = request.Status;
        existingRequest.Priority = request.Priority;
        existingRequest.RequestDate = request.RequestDate;
        existingRequest.ApprovedBy = request.ApprovedBy ?? string.Empty;

        await _context.SaveChangesAsync();

        return Ok(existingRequest);
    }

    // DELETE: api/Procurement/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var request = await _context.ProcurementRequests.FindAsync(id);
        if (request == null)
            return NotFound();

        _context.ProcurementRequests.Remove(request);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Procurement/status/{status}
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<ProcurementRequest>>> GetByStatus(string status)
    {
        return await _context.ProcurementRequests
            .Where(p => p.Status == status)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Procurement/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.ProcurementRequests.CountAsync();
        var pending = await _context.ProcurementRequests.CountAsync(p => p.Status == "Pending");
        var approved = await _context.ProcurementRequests.CountAsync(p => p.Status == "Approved");
        var rejected = await _context.ProcurementRequests.CountAsync(p => p.Status == "Rejected");
        var totalAmount = await _context.ProcurementRequests.SumAsync(p => p.TotalAmount);

        return Ok(new { total, pending, approved, rejected, totalAmount });
    }
}