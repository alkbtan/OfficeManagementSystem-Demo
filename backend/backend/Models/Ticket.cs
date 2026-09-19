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
    public string AssignedTo { get; set; } = string.Empty;

    [MaxLength(50)]
    public string JiraTicket { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Link { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime? Date { get; set; }

    [MaxLength(20)]
    public string Floor { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Company { get; set; } = string.Empty;

    [MaxLength(50)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}