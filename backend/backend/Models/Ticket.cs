using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Ticket
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Open";

    [MaxLength(20)]
    public string Priority { get; set; } = "Medium";

    [MaxLength(100)]
    public string? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}