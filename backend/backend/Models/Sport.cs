using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Sport
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [MaxLength(10)]
    public string Time { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Preparation { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Equipment { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(50)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}