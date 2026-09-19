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
public class ProcurementController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProcurementController(ApplicationDbContext context)
    {
        _context = context;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProcurementRequest>>> GetAll()
    {
        return await _context.ProcurementRequests
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProcurementRequest>> GetById(int id)
    {
        var request = await _context.ProcurementRequests.FindAsync(id);
        if (request == null)
            return NotFound();
        return request;
    }

    [HttpPost]
    public async Task<ActionResult<ProcurementRequest>> Create([FromBody] ProcurementRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Item))
            return BadRequest(new { message = "Item is required" });

        if (string.IsNullOrWhiteSpace(request.RequesterName))
            return BadRequest(new { message = "Requester Name is required" });

        if (string.IsNullOrWhiteSpace(request.RequestNumber))
        {
            var year = DateTime.UtcNow.Year.ToString().Substring(2);
            var count = await _context.ProcurementRequests.CountAsync() + 1;
            request.RequestNumber = $"PR-{year}-{count:D3}";
        }

        request.Total = (request.UnitPrice * request.Quantity) + request.ShippingCost;

        request.FormDate = EnsureUtc(request.FormDate);
        request.PurchaseDeadline = EnsureUtcNullable(request.PurchaseDeadline);
        request.ApprovalDate = EnsureUtcNullable(request.ApprovalDate);
        request.BoletoDueDate = EnsureUtcNullable(request.BoletoDueDate);
        request.PaymentDate = EnsureUtcNullable(request.PaymentDate);
        request.ExpectedDeliveryDate = EnsureUtcNullable(request.ExpectedDeliveryDate);

        request.CreatedBy = CurrentUsername;
        request.CreatedAt = DateTime.UtcNow;

        _context.ProcurementRequests.Add(request);
        await _context.SaveChangesAsync();

        return Ok(request);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProcurementRequest request)
    {
        var existingRequest = await _context.ProcurementRequests.FindAsync(id);
        if (existingRequest == null)
            return NotFound(new { message = "Procurement request not found" });

        if (!CanDeleteAny && existingRequest.CreatedBy != CurrentUsername)
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Item))
            return BadRequest(new { message = "Item is required" });

        if (string.IsNullOrWhiteSpace(request.RequesterName))
            return BadRequest(new { message = "Requester Name is required" });

        existingRequest.RequestNumber = request.RequestNumber;
        existingRequest.Item = request.Item;
        existingRequest.ItemId = request.ItemId ?? string.Empty;
        existingRequest.RequesterName = request.RequesterName;
        existingRequest.Department = request.Department;
        existingRequest.Floor = request.Floor ?? string.Empty;
        existingRequest.Project = request.Project ?? string.Empty;
        existingRequest.Responsible = request.Responsible ?? string.Empty;
        existingRequest.BriefDescription = request.BriefDescription ?? string.Empty;

        existingRequest.Supplier = request.Supplier ?? string.Empty;
        existingRequest.ProductLink = request.ProductLink ?? string.Empty;
        existingRequest.UnitPrice = request.UnitPrice;
        existingRequest.Quantity = request.Quantity;
        existingRequest.ShippingCost = request.ShippingCost;
        existingRequest.Total = (request.UnitPrice * request.Quantity) + request.ShippingCost;
        existingRequest.Classification = request.Classification ?? "One-Time Payment";
        existingRequest.PaymentMethod = request.PaymentMethod ?? "PIX";

        existingRequest.Priority = request.Priority ?? "Medium";
        existingRequest.Status = request.Status ?? "Collecting Information";
        existingRequest.FormDate = EnsureUtc(request.FormDate);
        existingRequest.PurchaseDeadline = EnsureUtcNullable(request.PurchaseDeadline);

        existingRequest.ApprovedBy = request.ApprovedBy ?? string.Empty;
        existingRequest.ApprovalDate = EnsureUtcNullable(request.ApprovalDate);
        existingRequest.ApprovalDocumentPath = request.ApprovalDocumentPath ?? string.Empty;
        existingRequest.TicketLink = request.TicketLink ?? string.Empty;

        existingRequest.InvoiceNumber = request.InvoiceNumber ?? string.Empty;
        existingRequest.BoletoDueDate = EnsureUtcNullable(request.BoletoDueDate);
        existingRequest.PaymentDate = EnsureUtcNullable(request.PaymentDate);
        existingRequest.BoletoFilePath = request.BoletoFilePath ?? string.Empty;
        existingRequest.PaymentReceiptPath = request.PaymentReceiptPath ?? string.Empty;

        existingRequest.ExpectedDeliveryDate = EnsureUtcNullable(request.ExpectedDeliveryDate);
        existingRequest.PurchaseDataFilePath = request.PurchaseDataFilePath ?? string.Empty;

        await _context.SaveChangesAsync();
        return Ok(existingRequest);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var request = await _context.ProcurementRequests.FindAsync(id);
        if (request == null)
            return NotFound();

        if (!CanDeleteAny && request.CreatedBy != CurrentUsername)
            return Forbid();

        _context.ProcurementRequests.Remove(request);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<ProcurementRequest>>> GetByStatus(string status)
    {
        return await _context.ProcurementRequests
            .Where(p => p.Status == status)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

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