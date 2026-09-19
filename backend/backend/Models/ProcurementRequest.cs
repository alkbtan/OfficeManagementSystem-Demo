using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class ProcurementRequest
{
    public int Id { get; set; }

    [MaxLength(50)]
    public string RequestNumber { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Item { get; set; } = string.Empty;

    [MaxLength(100)]
    public string ItemId { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string RequesterName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Floor { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Project { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Responsible { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string BriefDescription { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Supplier { get; set; } = string.Empty;

    [MaxLength(500)]
    public string ProductLink { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal ShippingCost { get; set; }
    public decimal Total { get; set; }

    [MaxLength(50)]
    public string Classification { get; set; } = "One-Time Payment";

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "PIX";

    [MaxLength(20)]
    public string Priority { get; set; } = "Medium";

    [MaxLength(50)]
    public string Status { get; set; } = "Collecting Information";

    public DateTime FormDate { get; set; } = DateTime.UtcNow;
    public DateTime? PurchaseDeadline { get; set; }

    [MaxLength(100)]
    public string ApprovedBy { get; set; } = string.Empty;

    public DateTime? ApprovalDate { get; set; }

    [MaxLength(500)]
    public string ApprovalDocumentPath { get; set; } = string.Empty;

    [MaxLength(500)]
    public string TicketLink { get; set; } = string.Empty;

    [MaxLength(100)]
    public string InvoiceNumber { get; set; } = string.Empty;

    public DateTime? BoletoDueDate { get; set; }
    public DateTime? PaymentDate { get; set; }

    [MaxLength(500)]
    public string BoletoFilePath { get; set; } = string.Empty;

    [MaxLength(500)]
    public string PaymentReceiptPath { get; set; } = string.Empty;

    public DateTime? ExpectedDeliveryDate { get; set; }

    [MaxLength(500)]
    public string PurchaseDataFilePath { get; set; } = string.Empty;

    [MaxLength(50)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}