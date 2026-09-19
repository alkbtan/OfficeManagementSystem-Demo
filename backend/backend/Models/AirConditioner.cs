using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

public class AirConditioner
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Location { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Brand { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Model { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public DateTime InstallationDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Operational";

    public DateTime LastMaintenance { get; set; }

    public decimal TotalMaintenanceCost { get; set; }

    public int MaintenanceCount { get; set; }

    public List<ACIssue> Issues { get; set; } = new();

    [MaxLength(50)]
    public string CreatedBy { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}