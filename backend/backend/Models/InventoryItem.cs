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
    public int MaxStock { get; set; }

    [MaxLength(10)]
    public string Unit { get; set; } = string.Empty;

    public decimal PurchasePrice { get; set; }
    public decimal Consumption { get; set; }

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}