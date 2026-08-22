using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class Employee
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Department { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Status { get; set; } = "Active";

    // ✅ NEW FIELDS
    [MaxLength(100)]
    public string? Location { get; set; }

    public DateTime? Birthday { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}