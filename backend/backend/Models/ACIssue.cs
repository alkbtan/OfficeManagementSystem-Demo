using System.ComponentModel.DataAnnotations;

namespace OfficeManagementAPI.Models;

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