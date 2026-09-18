using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Data;

public static class SeedData
{
    public static void Initialize(ApplicationDbContext context)
    {
        // =========================================================
        // Seed Users
        // =========================================================
        if (!context.Users.Any())
        {
            context.Users.AddRange(
                new User
                {
                    Name = "Kinoura Youssef",
                    Email = "kinour.youssef@testflyqa.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = "Manager",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Admin User",
                    Email = "admin@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = "Admin",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Ahmed Hassan",
                    Email = "ahmed.hassan@testflyqa.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = "User",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Name = "Sara Ali",
                    Email = "sara.ali@testflyqa.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = "User",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Employees
        // =========================================================
        if (!context.Employees.Any())
        {
            context.Employees.AddRange(
                new Employee
                {
                    FirstName = "Kinoura",
                    LastName = "Youssef",
                    Email = "kinour.youssef@testflyqa.com",
                    Department = "QA",
                    Status = "Active",
                    Location = "17th",
                    Birthday = new DateTime(1998, 1, 20),
                    CreatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Ahmed",
                    LastName = "Hassan",
                    Email = "ahmed.hassan@testflyqa.com",
                    Department = "IT",
                    Status = "Active",
                    Location = "15th",
                    Birthday = new DateTime(1995, 6, 15),
                    CreatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Sara",
                    LastName = "Ali",
                    Email = "sara.ali@testflyqa.com",
                    Department = "HR",
                    Status = "Active",
                    Location = "18th",
                    Birthday = new DateTime(1990, 3, 10),
                    CreatedAt = DateTime.UtcNow
                },
                new Employee
                {
                    FirstName = "Mohamed",
                    LastName = "Ibrahim",
                    Email = "mohamed.ibrahim@testflyqa.com",
                    Department = "Office",
                    Status = "Active",
                    Location = "7th",
                    Birthday = new DateTime(1988, 11, 25),
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Assets
        // =========================================================
        if (!context.Assets.Any())
        {
            context.Assets.AddRange(
                new Asset
                {
                    Name = "Laptop Dell XPS",
                    Type = "Computer",
                    Model = "XPS 15",
                    SerialNumber = "SN-2026-001",
                    Status = "In Use",
                    AssignedTo = "Kinoura Youssef",
                    Location = "17th",
                    CreatedAt = DateTime.UtcNow
                },
                new Asset
                {
                    Name = "HP LaserJet",
                    Type = "Printer",
                    Model = "MFP 283",
                    SerialNumber = "SN-2026-002",
                    Status = "Available",
                    Location = "Office",
                    CreatedAt = DateTime.UtcNow
                },
                new Asset
                {
                    Name = "Samsung Monitor",
                    Type = "Monitor",
                    Model = "S27A",
                    SerialNumber = "SN-2026-003",
                    Status = "In Use",
                    AssignedTo = "Ahmed Hassan",
                    Location = "15th",
                    CreatedAt = DateTime.UtcNow
                },
                new Asset
                {
                    Name = "Office Chair",
                    Type = "Chair",
                    Model = "Ergo Pro",
                    SerialNumber = "SN-2026-004",
                    Status = "Available",
                    Location = "HR",
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Inventory Items
        // =========================================================
        if (!context.InventoryItems.Any())
        {
            context.InventoryItems.AddRange(
                new InventoryItem
                {
                    Name = "Toilet Paper",
                    Category = "Bathroom Supplies",
                    Quantity = 50,
                    MinStock = 10,
                    Unit = "Box",
                    Supplier = "Mercado Livre",
                    PurchaseDate = new DateTime(2026, 8, 15),
                    Status = "In Stock",
                    LastUpdated = DateTime.UtcNow
                },
                new InventoryItem
                {
                    Name = "Hand Soap",
                    Category = "Bathroom Supplies",
                    Quantity = 20,
                    MinStock = 5,
                    Unit = "Bottle",
                    Supplier = "Sonda",
                    PurchaseDate = new DateTime(2026, 8, 10),
                    Status = "In Stock",
                    LastUpdated = DateTime.UtcNow
                },
                new InventoryItem
                {
                    Name = "Coffee",
                    Category = "Kitchen Supplies",
                    Quantity = 15,
                    MinStock = 5,
                    Unit = "Pack",
                    Supplier = "Kalunga",
                    PurchaseDate = new DateTime(2026, 8, 5),
                    Status = "In Stock",
                    LastUpdated = DateTime.UtcNow
                },
                new InventoryItem
                {
                    Name = "Paper Towels",
                    Category = "Cleaning Supplies",
                    Quantity = 30,
                    MinStock = 8,
                    Unit = "Roll",
                    Supplier = "ARTECOOL",
                    PurchaseDate = new DateTime(2026, 8, 1),
                    Status = "In Stock",
                    LastUpdated = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed AC Units
        // =========================================================
        if (!context.AirConditioners.Any())
        {
            context.AirConditioners.AddRange(
                new AirConditioner
                {
                    Name = "AC Unit 1",
                    Location = "17th",
                    Brand = "LG",
                    Model = "Dual Inverter",
                    Capacity = 12000,
                    Status = "Operational",
                    InstallationDate = new DateTime(2025, 6, 1),
                    LastMaintenance = new DateTime(2026, 7, 15),
                    TotalMaintenanceCost = 350.00m,
                    MaintenanceCount = 2,
                    CreatedAt = DateTime.UtcNow
                },
                new AirConditioner
                {
                    Name = "AC Unit 2",
                    Location = "15th",
                    Brand = "Samsung",
                    Model = "Wind-Free",
                    Capacity = 9000,
                    Status = "Operational",
                    InstallationDate = new DateTime(2025, 7, 1),
                    LastMaintenance = new DateTime(2026, 6, 20),
                    TotalMaintenanceCost = 200.00m,
                    MaintenanceCount = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new AirConditioner
                {
                    Name = "AC Unit 3",
                    Location = "18th",
                    Brand = "Carrier",
                    Model = "42Q",
                    Capacity = 18000,
                    Status = "Under Maintenance",
                    InstallationDate = new DateTime(2024, 12, 1),
                    LastMaintenance = new DateTime(2026, 8, 1),
                    TotalMaintenanceCost = 500.00m,
                    MaintenanceCount = 3,
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Lockers
        // =========================================================
        if (!context.Lockers.Any())
        {
            context.Lockers.AddRange(
                new Locker
                {
                    Number = "L-001",
                    Location = "17th",
                    Status = "Occupied",
                    LockType = "Key",
                    AssignedTo = "Kinoura Youssef",
                    AssignedToName = "Kinoura Youssef",
                    BiometricEnabled = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Locker
                {
                    Number = "L-002",
                    Location = "15th",
                    Status = "Available",
                    LockType = "Combination",
                    CreatedAt = DateTime.UtcNow
                },
                new Locker
                {
                    Number = "L-003",
                    Location = "18th",
                    Status = "Available",
                    LockType = "Electronic",
                    BiometricEnabled = true,
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Tickets (Maintenance)
        // =========================================================
        if (!context.Tickets.Any())
        {
            context.Tickets.AddRange(
                new Ticket
                {
                    Title = "AC not cooling",
                    Description = "AC unit on 17th floor not cooling properly. Needs immediate attention.",
                    Status = "In Progress",
                    Priority = "High",
                    AssignedTo = "Kinoura Youssef",
                    JiraTicket = "PROJ-101",
                    Link = "https://jira.testflyqa.com/PROJ-101",
                    Amount = 350.00m,
                    Date = new DateTime(2026, 8, 20),
                    Floor = "17th",
                    Company = "ARTECOOL",
                    CreatedAt = DateTime.UtcNow
                },
                new Ticket
                {
                    Title = "Printer jam",
                    Description = "HP LaserJet constantly jamming. Need technician to check.",
                    Status = "Open",
                    Priority = "Medium",
                    AssignedTo = "Ahmed Hassan",
                    JiraTicket = "PROJ-102",
                    Link = "https://jira.testflyqa.com/PROJ-102",
                    Amount = 0,
                    Date = new DateTime(2026, 8, 18),
                    Floor = "Office",
                    Company = "Sonda",
                    CreatedAt = DateTime.UtcNow
                },
                new Ticket
                {
                    Title = "Light bulb replacement",
                    Description = "Need to replace light bulbs on 18th floor hallway.",
                    Status = "Resolved",
                    Priority = "Low",
                    JiraTicket = "PROJ-103",
                    Link = "https://jira.testflyqa.com/PROJ-103",
                    Amount = 50.00m,
                    Date = new DateTime(2026, 8, 15),
                    Floor = "18th",
                    Company = "Mercado Livre",
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Procurement Requests
        // =========================================================
        if (!context.ProcurementRequests.Any())
        {
            context.ProcurementRequests.AddRange(
                new ProcurementRequest
                {
                    RequestNumber = "PR-26-001",
                    Item = "Office supplies (paper, pens, folders)",
                    ItemId = "OFF-001",
                    RequesterName = "Kinoura Youssef",
                    Department = "QA",
                    Floor = "17th",
                    Project = "Blizzard",
                    Responsible = "Kinoura Youssef - Approve urgently",
                    BriefDescription = "Monthly office supplies for QA department",
                    Supplier = "Sonda",
                    ProductLink = "",
                    UnitPrice = 50.00m,
                    Quantity = 5,
                    ShippingCost = 0,
                    Total = 250.00m,
                    Classification = "One-Time Payment",
                    PaymentMethod = "Boleto",
                    Priority = "Medium",
                    Status = "Approved",
                    FormDate = new DateTime(2026, 8, 10),
                    PurchaseDeadline = new DateTime(2026, 8, 20),
                    ApprovedBy = "Admin User",
                    ApprovalDate = new DateTime(2026, 8, 11),
                    CreatedAt = DateTime.UtcNow
                },
                new ProcurementRequest
                {
                    RequestNumber = "PR-26-002",
                    Item = "5 laptops, 3 monitors",
                    ItemId = "IT-2026-015",
                    RequesterName = "Ahmed Hassan",
                    Department = "IT",
                    Floor = "15th",
                    Project = "Valkyrie",
                    Responsible = "Ahmed Hassan - Check with finance first",
                    BriefDescription = "New equipment for IT team expansion",
                    Supplier = "Mercado Livre",
                    ProductLink = "https://mercadolivre.com.br/item/12345",
                    UnitPrice = 3000.00m,
                    Quantity = 5,
                    ShippingCost = 0,
                    Total = 15000.00m,
                    Classification = "Installment Payment",
                    PaymentMethod = "Mercado Livre",
                    Priority = "High",
                    Status = "Awaiting Approval",
                    FormDate = new DateTime(2026, 8, 5),
                    PurchaseDeadline = new DateTime(2026, 8, 25),
                    CreatedAt = DateTime.UtcNow
                },
                new ProcurementRequest
                {
                    RequestNumber = "PR-26-003",
                    Item = "Training materials",
                    ItemId = "HR-TRN-003",
                    RequesterName = "Sara Ali",
                    Department = "HR",
                    Floor = "18th",
                    Project = "BRLEF",
                    Responsible = "Sara Ali - For September training",
                    BriefDescription = "Materials for new employee training program",
                    Supplier = "Kalunga",
                    ProductLink = "",
                    UnitPrice = 100.00m,
                    Quantity = 5,
                    ShippingCost = 0,
                    Total = 500.00m,
                    Classification = "One-Time Payment",
                    PaymentMethod = "PIX",
                    Priority = "Low",
                    Status = "Approved",
                    FormDate = new DateTime(2026, 8, 1),
                    PurchaseDeadline = new DateTime(2026, 8, 15),
                    ApprovedBy = "Admin User",
                    ApprovalDate = new DateTime(2026, 8, 3),
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Events
        // =========================================================
        if (!context.Events.Any())
        {
            context.Events.AddRange(
                new Event
                {
                    Title = "Team Building",
                    Description = "Annual team building event for all departments",
                    EventDate = new DateTime(2026, 9, 15),
                    Time = "14:00",
                    Location = "Office",
                    Type = "Team Building",
                    Status = "Upcoming",
                    Preparation = "Book venue, arrange catering, prepare activities",
                    Equipment = "Projector, speakers, tables, chairs",
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "Birthday Celebration",
                    Description = "Celebrating Kinoura's birthday",
                    EventDate = new DateTime(2026, 9, 20),
                    Time = "12:00",
                    Location = "Kitchen",
                    Type = "Birthday",
                    Status = "Upcoming",
                    Preparation = "Order cake, prepare decorations, arrange food",
                    Equipment = "Cutlery, plates, cups, decorations",
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    Title = "QA Meeting",
                    Description = "Monthly QA department meeting",
                    EventDate = new DateTime(2026, 8, 25),
                    Time = "10:00",
                    Location = "Meeting Room",
                    Type = "General",
                    Status = "Upcoming",
                    Preparation = "Prepare agenda, setup meeting room",
                    Equipment = "Projector, laptop, markers",
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Documents
        // =========================================================
        if (!context.Documents.Any())
        {
            context.Documents.AddRange(
                new Document
                {
                    Name = "Office Supplies Invoice",
                    Type = "Purchase Request",
                    Category = "Office Supplies",
                    Supplier = "Sonda",
                    Date = new DateTime(2026, 8, 10),
                    Amount = 250.00m,
                    Status = "Approved",
                    Description = "Monthly office supplies invoice",
                    FilePath = "",
                    FileSize = 0,
                    UploadDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new Document
                {
                    Name = "Equipment Purchase",
                    Type = "Quotation",
                    Category = "IT Equipment",
                    Supplier = "Mercado Livre",
                    Date = new DateTime(2026, 8, 5),
                    Amount = 15000.00m,
                    Status = "Pending Approval",
                    Description = "Quotation for 5 laptops and 3 monitors",
                    FilePath = "",
                    FileSize = 0,
                    UploadDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                },
                new Document
                {
                    Name = "Maintenance Contract",
                    Type = "Approval",
                    Category = "Maintenance",
                    Supplier = "ARTECOOL",
                    Date = new DateTime(2026, 7, 20),
                    Amount = 2000.00m,
                    Status = "Approved",
                    Description = "Annual maintenance contract",
                    FilePath = "",
                    FileSize = 0,
                    UploadDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }

        // =========================================================
        // Seed Sports
        // =========================================================
        if (!context.Sports.Any())
        {
            context.Sports.AddRange(
                new Sport
                {
                    Name = "Football Match",
                    Date = new DateTime(2026, 9, 5),
                    Time = "16:00",
                    Preparation = "Book football field, arrange referees",
                    Equipment = "Football, nets, bibs",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                },
                new Sport
                {
                    Name = "Basketball Practice",
                    Date = new DateTime(2026, 8, 28),
                    Time = "18:00",
                    Preparation = "Book basketball court, prepare balls",
                    Equipment = "Basketballs, cones",
                    Status = "Preparing",
                    CreatedAt = DateTime.UtcNow
                },
                new Sport
                {
                    Name = "Table Tennis Tournament",
                    Date = new DateTime(2026, 9, 12),
                    Time = "15:00",
                    Preparation = "Set up tables, arrange brackets",
                    Equipment = "Table tennis tables, paddles, balls",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }
    }
}