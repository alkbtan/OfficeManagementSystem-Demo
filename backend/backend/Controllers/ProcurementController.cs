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
        if (string.IsNullOrWhiteSpace(request.Item))
            return BadRequest(new { message = "Item is required" });

        if (string.IsNullOrWhiteSpace(request.RequesterName))
            return BadRequest(new { message = "Requester Name is required" });

        // Auto-generate request number if empty
        if (string.IsNullOrWhiteSpace(request.RequestNumber))
        {
            var year = DateTime.UtcNow.Year.ToString().Substring(2);
            var count = await _context.ProcurementRequests.CountAsync() + 1;
            request.RequestNumber = $"PR-{year}-{count:D3}";
        }

        // Auto-calculate Total
        request.Total = (request.UnitPrice * request.Quantity) + request.ShippingCost;

        // Normalize dates to UTC
        request.FormDate = EnsureUtc(request.FormDate);
        request.PurchaseDeadline = EnsureUtcNullable(request.PurchaseDeadline);
        request.ApprovalDate = EnsureUtcNullable(request.ApprovalDate);
        request.BoletoDueDate = EnsureUtcNullable(request.BoletoDueDate);
        request.PaymentDate = EnsureUtcNullable(request.PaymentDate);
        request.ExpectedDeliveryDate = EnsureUtcNullable(request.ExpectedDeliveryDate);
        request.CreatedAt = DateTime.UtcNow;

        _context.ProcurementRequests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(request);
    }

    // PUT: api/Procurement/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProcurementRequest request)
    {
        var existingRequest = await _context.ProcurementRequests.FindAsync(id);
        if (existingRequest == null)
            return NotFound(new { message = "Procurement request not found" });

        if (string.IsNullOrWhiteSpace(request.Item))
            return BadRequest(new { message = "Item is required" });

        if (string.IsNullOrWhiteSpace(request.RequesterName))
            return BadRequest(new { message = "Requester Name is required" });

        // 1. Request Information
        existingRequest.RequestNumber = request.RequestNumber;
        existingRequest.Item = request.Item;
        existingRequest.ItemId = request.ItemId ?? string.Empty;
        existingRequest.RequesterName = request.RequesterName;
        existingRequest.Department = request.Department;
        existingRequest.Floor = request.Floor ?? string.Empty;
        existingRequest.Project = request.Project ?? string.Empty;
        existingRequest.Responsible = request.Responsible ?? string.Empty;
        existingRequest.BriefDescription = request.BriefDescription ?? string.Empty;

        // 2. Purchase Information
        existingRequest.Supplier = request.Supplier ?? string.Empty;
        existingRequest.ProductLink = request.ProductLink ?? string.Empty;
        existingRequest.UnitPrice = request.UnitPrice;
        existingRequest.Quantity = request.Quantity;
        existingRequest.ShippingCost = request.ShippingCost;
        existingRequest.Total = (request.UnitPrice * request.Quantity) + request.ShippingCost;
        existingRequest.Classification = request.Classification ?? "One-Time Payment";
        existingRequest.PaymentMethod = request.PaymentMethod ?? "PIX";

        // 3. Request Control
        existingRequest.Priority = request.Priority ?? "Medium";
        existingRequest.Status = request.Status ?? "Collecting Information";
        existingRequest.FormDate = EnsureUtc(request.FormDate);
        existingRequest.PurchaseDeadline = EnsureUtcNullable(request.PurchaseDeadline);

        // 4. Approval
        existingRequest.ApprovedBy = request.ApprovedBy ?? string.Empty;
        existingRequest.ApprovalDate = EnsureUtcNullable(request.ApprovalDate);
        existingRequest.ApprovalDocumentPath = request.ApprovalDocumentPath ?? string.Empty;
        existingRequest.TicketLink = request.TicketLink ?? string.Empty;

        // 5. Payment
        existingRequest.InvoiceNumber = request.InvoiceNumber ?? string.Empty;
        existingRequest.BoletoDueDate = EnsureUtcNullable(request.BoletoDueDate);
        existingRequest.PaymentDate = EnsureUtcNullable(request.PaymentDate);
        existingRequest.BoletoFilePath = request.BoletoFilePath ?? string.Empty;
        existingRequest.PaymentReceiptPath = request.PaymentReceiptPath ?? string.Empty;

        // 6. Delivery
        existingRequest.ExpectedDeliveryDate = EnsureUtcNullable(request.ExpectedDeliveryDate);
        existingRequest.PurchaseDataFilePath = request.PurchaseDataFilePath ?? string.Empty;

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
        var pending = await _context.ProcurementRequests.CountAsync(p => p.Status == "Awaiting Approval");
        var approved = await _context.ProcurementRequests.CountAsync(p => p.Status == "Approved");
        var completed = await _context.ProcurementRequests.CountAsync(p => p.Status == "Order Completed");
        var totalAmount = await _context.ProcurementRequests.SumAsync(p => p.Total);

        return Ok(new { total, pending, approved, completed, totalAmount });
    }

    // =========================================================
    // Helpers
    // =========================================================
    private static DateTime EnsureUtc(DateTime value)
    {
        if (value.Kind == DateTimeKind.Utc) return value;
        return DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }

    private static DateTime? EnsureUtcNullable(DateTime? value)
    {
        if (!value.HasValue) return null;
        return EnsureUtc(value.Value);
    }
}