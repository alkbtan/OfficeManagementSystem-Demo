using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;
using System.Security.Claims;

namespace OfficeManagementAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public DocumentsController(
        ApplicationDbContext context,
        IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    private string CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value ?? "";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanDeleteAny => CurrentRole == "Admin" || CurrentRole == "Manager";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Document>>> GetAll()
    {
        return await _context.Documents
            .OrderByDescending(d => d.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Document>> GetById(int id)
    {
        var document = await _context.Documents.FindAsync(id);

        if (document == null)
            return NotFound();

        return Ok(document);
    }

    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<ActionResult<Document>> Create(
        [FromForm] Document document,
        IFormFile? file)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (document.Date.Kind != DateTimeKind.Utc)
            document.Date = DateTime.SpecifyKind(document.Date, DateTimeKind.Utc);

        if (file != null && file.Length > 0)
        {
            var uploadResult = await SaveFileAsync(file);

            if (!uploadResult.Success)
                return BadRequest(uploadResult.ErrorMessage);

            document.FilePath = uploadResult.FilePath!;
            document.FileSize = file.Length;
        }

        document.CreatedBy = CurrentUsername;
        document.UploadDate = DateTime.UtcNow;
        document.CreatedAt = DateTime.UtcNow;

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = document.Id }, document);
    }

    [HttpPut("{id}")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> Update(
        int id,
        [FromForm] Document document,
        IFormFile? file)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        if (document.Date.Kind != DateTimeKind.Utc)
            document.Date = DateTime.SpecifyKind(document.Date, DateTimeKind.Utc);

        var existingDocument = await _context.Documents.FindAsync(id);

        if (existingDocument == null)
            return NotFound();

        if (!CanDeleteAny && existingDocument.CreatedBy != CurrentUsername)
            return Forbid();

        existingDocument.Name = document.Name;
        existingDocument.Type = document.Type;
        existingDocument.Category = document.Category;
        existingDocument.Supplier = document.Supplier;
        existingDocument.Date = document.Date;
        existingDocument.Amount = document.Amount;
        existingDocument.Status = document.Status;
        existingDocument.Description = document.Description;

        if (file != null && file.Length > 0)
        {
            DeletePhysicalFile(existingDocument.FilePath);

            var uploadResult = await SaveFileAsync(file);

            if (!uploadResult.Success)
                return BadRequest(uploadResult.ErrorMessage);

            existingDocument.FilePath = uploadResult.FilePath!;
            existingDocument.FileSize = file.Length;
            existingDocument.UploadDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(existingDocument);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var document = await _context.Documents.FindAsync(id);

        if (document == null)
            return NotFound();

        if (!CanDeleteAny && document.CreatedBy != CurrentUsername)
            return Forbid();

        DeletePhysicalFile(document.FilePath);
        _context.Documents.Remove(document);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<Document>>> GetByCategory(string category)
    {
        return await _context.Documents
            .Where(d => d.Category == category)
            .OrderByDescending(d => d.Date)
            .ToListAsync();
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> Download(int id)
    {
        var document = await _context.Documents.FindAsync(id);

        if (document == null)
            return NotFound("Document not found.");

        if (string.IsNullOrWhiteSpace(document.FilePath))
            return NotFound("This document has no file.");

        var fullPath = GetPhysicalFilePath(document.FilePath);

        if (string.IsNullOrWhiteSpace(fullPath) || !System.IO.File.Exists(fullPath))
            return NotFound("File not found on server.");

        var contentType = GetContentType(fullPath);
        var fileName = Path.GetFileName(fullPath);

        return PhysicalFile(fullPath, contentType, fileName);
    }

    private async Task<FileUploadResult> SaveFileAsync(IFormFile file)
    {
        var allowedExtensions = new[] { ".pdf", ".xls", ".xlsx", ".doc", ".docx" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            return new FileUploadResult { Success = false, ErrorMessage = "Only PDF, Excel and Word files are allowed." };

        const long maxFileSize = 50 * 1024 * 1024;

        if (file.Length > maxFileSize)
            return new FileUploadResult { Success = false, ErrorMessage = "File size cannot exceed 50 MB." };

        var webRoot = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var uploadsFolder = Path.Combine(webRoot, "uploads", "documents");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var fullFilePath = Path.Combine(uploadsFolder, uniqueFileName);

        await using var stream = new FileStream(fullFilePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return new FileUploadResult
        {
            Success = true,
            FilePath = $"/uploads/documents/{uniqueFileName}"
        };
    }

    private void DeletePhysicalFile(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return;

        var fullPath = GetPhysicalFilePath(relativePath);

        if (!string.IsNullOrWhiteSpace(fullPath) && System.IO.File.Exists(fullPath))
        {
            try { System.IO.File.Delete(fullPath); }
            catch { /* ignore */ }
        }
    }

    private string? GetPhysicalFilePath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return null;

        var webRoot = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var cleanPath = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        return Path.Combine(webRoot, cleanPath);
    }

    private static string GetContentType(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();

        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream"
        };
    }

    private class FileUploadResult
    {
        public bool Success { get; set; }
        public string? FilePath { get; set; }
        public string? ErrorMessage { get; set; }
    }
}