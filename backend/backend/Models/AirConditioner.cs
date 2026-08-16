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

    public int Capacity { get; set; } // BTU

    public DateTime InstallationDate { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Operational";

    public DateTime LastMaintenance { get; set; }

    public decimal TotalMaintenanceCost { get; set; }

    public int MaintenanceCount { get; set; }

    public List<ACIssue> Issues { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ACIssue
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string IssueType { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public DateTime ReportedDate { get; set; }

    public DateTime? ResolvedDate { get; set; }

    public decimal Cost { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Open";

    public int AirConditionerId { get; set; }
    public AirConditioner? AirConditioner { get; set; }
}