using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Sport
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // Futsal, Table Tennis, Chess, Basketball

    [MaxLength(100)]
    public string Teams { get; set; } = string.Empty;

    public DateTime? NextMatch { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Active"; // Active, Completed, Upcoming

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}