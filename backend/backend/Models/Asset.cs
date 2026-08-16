using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Asset
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [MaxLength(50)]
    public string SerialNumber { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Available";

    [MaxLength(100)]
    public string? AssignedTo { get; set; }

    public DateTime PurchaseDate { get; set; }

    public DateTime? WarrantyExpiry { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}