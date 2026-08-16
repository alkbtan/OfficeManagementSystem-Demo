using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Request
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [Required]
    [MaxLength(100)]
    public string RequestedBy { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Priority { get; set; } = "Medium";

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}