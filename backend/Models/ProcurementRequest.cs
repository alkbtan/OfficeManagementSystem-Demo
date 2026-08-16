using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class ProcurementRequest
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string RequestNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Department { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Requester { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Vendor { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Items { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(20)]
    public string Priority { get; set; } = "Medium";

    public DateTime RequestDate { get; set; } = DateTime.UtcNow;

    public DateTime? ApprovedDate { get; set; }

    public string? ApprovedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}