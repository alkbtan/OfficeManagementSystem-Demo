using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Budget
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty; // Maintenance, Procurement, Utilities, Events, Projects

    public decimal Planned { get; set; }

    public decimal Spent { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}