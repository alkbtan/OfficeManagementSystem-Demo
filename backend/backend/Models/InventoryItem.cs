using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class InventoryItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public int MinStock { get; set; }

    [MaxLength(20)]
    public string Unit { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Supplier { get; set; } = string.Empty;

    public DateTime? PurchaseDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "In Stock";

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}