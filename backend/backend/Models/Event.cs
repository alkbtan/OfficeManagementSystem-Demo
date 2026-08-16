using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Event
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime EventDate { get; set; }

    [MaxLength(100)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Type { get; set; } = "General"; // General, Team Building, Birthday, Anniversary, Welcome

    [MaxLength(20)]
    public string Status { get; set; } = "Upcoming"; // Upcoming, Ongoing, Completed, Cancelled

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}