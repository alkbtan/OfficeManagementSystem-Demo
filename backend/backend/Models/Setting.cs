using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Setting
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Category { get; set; } = "General";

    [MaxLength(100)]
    public string Description { get; set; } = string.Empty;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}