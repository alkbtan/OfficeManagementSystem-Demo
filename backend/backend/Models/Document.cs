using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Document
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // Invoice, Contract, Report, Plan

    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public long FileSize { get; set; }

    [MaxLength(100)]
    public string FilePath { get; set; } = string.Empty;

    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}