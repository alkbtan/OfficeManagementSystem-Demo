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
        // Validate Model State first
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(new { 
                message = "Validation failed", 
                errors = errors 
            });
        }

        // Validate required fields
        if (string.IsNullOrEmpty(request.Department))
        {
            return BadRequest(new { message = "Department is required" });
        }
        if (string.IsNullOrEmpty(request.Requester))
        {
            return BadRequest(new { message = "Requester name is required" });
        }
        if (string.IsNullOrEmpty(request.Vendor))
        {
            return BadRequest(new { message = "Vendor name is required" });
        }
        if (string.IsNullOrEmpty(request.Items))
        {
            return BadRequest(new { message = "Items are required" });
        }
        if (request.TotalAmount <= 0)
        {
            return BadRequest(new { message = "Total amount must be greater than 0" });
        }

        // Auto-generate request number
        request.RequestNumber = $"PR-{DateTime.Now.Year}-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";
        request.RequestDate = DateTime.UtcNow;
        request.CreatedAt = DateTime.UtcNow;
        request.Status = "Pending";
        
        _context.ProcurementRequests.Add(request);
        await _context.SaveChangesAsync();
        return Ok(request);
    }

    // PUT: api/Procurement/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProcurementRequest request)
    {
        // Validate ID match
        if (id != request.Id)
            return BadRequest(new { message = "ID mismatch" });

        // Check if request exists
        var existingRequest = await _context.ProcurementRequests.FindAsync(id);
        if (existingRequest == null)
            return NotFound(new { message = "Request not found" });

        // Validate fields
        if (string.IsNullOrEmpty(request.Department))
        {
            return BadRequest(new { message = "Department is required" });
        }
        if (string.IsNullOrEmpty(request.Requester))
        {
            return BadRequest(new { message = "Requester name is required" });
        }
        if (string.IsNullOrEmpty(request.Vendor))
        {
            return BadRequest(new { message = "Vendor name is required" });
        }
        if (string.IsNullOrEmpty(request.Items))
        {
            return BadRequest(new { message = "Items are required" });
        }
        if (request.TotalAmount <= 0)
        {
            return BadRequest(new { message = "Total amount must be greater than 0" });
        }

        // Update only the fields that can be changed
        existingRequest.Department = request.Department;
        existingRequest.Requester = request.Requester;
        existingRequest.Vendor = request.Vendor;
        existingRequest.Items = request.Items;
        existingRequest.TotalAmount = request.TotalAmount;
        existingRequest.Priority = request.Priority;
        existingRequest.Status = request.Status;

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

    // POST: api/Procurement/{id}/approve
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(int id, [FromBody] ApproveRequest approveRequest)
    {
        var request = await _context.ProcurementRequests.FindAsync(id);
        if (request == null)
            return NotFound();

        request.Status = "Approved";
        request.ApprovedDate = DateTime.UtcNow;
        request.ApprovedBy = approveRequest.ApprovedBy;

        await _context.SaveChangesAsync();
        return Ok(request);
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

public class ApproveRequest
{
    public string ApprovedBy { get; set; } = string.Empty;
}