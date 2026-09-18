using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class TodoTask
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Priority { get; set; } = "Medium"; // High, Medium, Low

    [MaxLength(20)]
    public string Category { get; set; } = "Work"; // Work, Personal, Urgent

    public DateTime DueDate { get; set; }

    public bool Completed { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }
}