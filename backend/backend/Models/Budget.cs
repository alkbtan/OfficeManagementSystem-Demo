using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Budget
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    public decimal Planned { get; set; }
    public decimal Spent { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }

    [MaxLength(50)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}