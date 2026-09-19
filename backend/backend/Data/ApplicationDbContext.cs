using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Asset> Assets { get; set; }
    public DbSet<Ticket> Tickets { get; set; }
    public DbSet<Request> Requests { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<AirConditioner> AirConditioners { get; set; }
    public DbSet<ACIssue> ACIssues { get; set; }
    public DbSet<Locker> Lockers { get; set; }
    public DbSet<ProcurementRequest> ProcurementRequests { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Sport> Sports { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<TodoTask> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Password).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(20).HasDefaultValue("User");
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
        });

        // Asset
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Model).HasMaxLength(100);
            entity.Property(e => e.SerialNumber).HasMaxLength(50);
            entity.HasIndex(e => e.SerialNumber).IsUnique();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Available");
            entity.Property(e => e.AssignedTo).HasMaxLength(100);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // Ticket
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(e => e.AssignedTo).HasMaxLength(100);
            entity.Property(e => e.JiraTicket).HasMaxLength(50);
            entity.Property(e => e.Link).HasMaxLength(500);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Floor).HasMaxLength(20);
            entity.Property(e => e.Company).HasMaxLength(100);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // Request
        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.RequestedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Medium");
        });

        // InventoryItem
        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Quantity).IsRequired();
            entity.Property(e => e.MinStock).IsRequired();
            entity.Property(e => e.Unit).HasMaxLength(20);
            entity.Property(e => e.Supplier).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("In Stock");
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // AirConditioner
        modelBuilder.Entity<AirConditioner>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Brand).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Model).HasMaxLength(50);
            entity.Property(e => e.Capacity).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Operational");
            entity.Property(e => e.TotalMaintenanceCost).HasPrecision(18, 2);
            entity.Property(e => e.MaintenanceCount).HasDefaultValue(0);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // ACIssue
        modelBuilder.Entity<ACIssue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IssueType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.Cost).HasPrecision(18, 2);

            entity.HasOne(e => e.AirConditioner)
                  .WithMany(e => e.Issues)
                  .HasForeignKey(e => e.AirConditionerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Locker
        modelBuilder.Entity<Locker>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Number).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Available");
            entity.Property(e => e.LockType).HasMaxLength(20).HasDefaultValue("Key");
            entity.Property(e => e.AssignedTo).HasMaxLength(100);
            entity.Property(e => e.AssignedToName).HasMaxLength(100);
            entity.Property(e => e.BiometricEnabled).HasDefaultValue(false);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // ProcurementRequest
        modelBuilder.Entity<ProcurementRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RequestNumber).HasMaxLength(50);
            entity.Property(e => e.Item).HasMaxLength(200);
            entity.Property(e => e.ItemId).HasMaxLength(100);
            entity.Property(e => e.RequesterName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Floor).HasMaxLength(20);
            entity.Property(e => e.Project).HasMaxLength(100);
            entity.Property(e => e.Responsible).HasMaxLength(200);
            entity.Property(e => e.BriefDescription).HasMaxLength(1000);
            entity.Property(e => e.Supplier).HasMaxLength(200);
            entity.Property(e => e.ProductLink).HasMaxLength(500);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.ShippingCost).HasPrecision(18, 2);
            entity.Property(e => e.Total).HasPrecision(18, 2);
            entity.Property(e => e.Classification).HasMaxLength(50);
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Collecting Information");
            entity.Property(e => e.ApprovedBy).HasMaxLength(100);
            entity.Property(e => e.ApprovalDocumentPath).HasMaxLength(500);
            entity.Property(e => e.TicketLink).HasMaxLength(500);
            entity.Property(e => e.InvoiceNumber).HasMaxLength(100);
            entity.Property(e => e.BoletoFilePath).HasMaxLength(500);
            entity.Property(e => e.PaymentReceiptPath).HasMaxLength(500);
            entity.Property(e => e.PurchaseDataFilePath).HasMaxLength(500);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // Budget
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Planned).HasPrecision(18, 2);
            entity.Property(e => e.Spent).HasPrecision(18, 2);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // Event
        modelBuilder.Entity<Event>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.Type).HasMaxLength(20).HasDefaultValue("General");
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Upcoming");
            entity.Property(e => e.Time).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Preparation).HasMaxLength(500);
            entity.Property(e => e.Equipment).HasMaxLength(500);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // Sport
        modelBuilder.Entity<Sport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Time).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Preparation).HasMaxLength(500);
            entity.Property(e => e.Equipment).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // Document
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.Supplier).HasMaxLength(100);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.FilePath).HasMaxLength(255);
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
        });

        // TodoTask
        modelBuilder.Entity<TodoTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(e => e.Category).HasMaxLength(20).HasDefaultValue("Work");
            entity.Property(e => e.Completed).HasDefaultValue(false);
        });
    }
}