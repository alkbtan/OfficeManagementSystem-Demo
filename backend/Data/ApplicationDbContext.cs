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
    public DbSet<Request> Requests { get; set; }  // ← أضف هذا السطر

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Employee Configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Department).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
        });

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Password).IsRequired();
            entity.Property(e => e.Role).HasMaxLength(20).HasDefaultValue("User");
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");
        });

        // Asset Configuration
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
        });

        // Ticket Configuration
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Open");
            entity.Property(e => e.Priority).HasMaxLength(20).HasDefaultValue("Medium");
            entity.Property(e => e.AssignedTo).HasMaxLength(100);
        });

        // Request Configuration
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
    }
}