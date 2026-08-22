using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Document
{
    public int Id { get; set; }

    // Document Name
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    // Document Type
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    // Category
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    // Supplier
    [Required]
    [MaxLength(200)]
    public string Supplier { get; set; } = string.Empty;

    // Document Date
    [Required]
    public DateTime Date { get; set; }

    // Amount
    [Required]
    public decimal Amount { get; set; }

    // Status
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending Approval";

    // Description
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    // Uploaded file information
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;

    public long FileSize { get; set; }

    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}