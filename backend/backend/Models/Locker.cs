using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Locker
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Number { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Available";

    [MaxLength(20)]
    public string LockType { get; set; } = "Key";

    [MaxLength(100)]
    public string? AssignedTo { get; set; }

    [MaxLength(100)]
    public string? AssignedToName { get; set; }

    public bool BiometricEnabled { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}