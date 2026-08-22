using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

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

    // =========================================================
    // GET: api/Documents
    // =========================================================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Document>>> GetAll()
    {
        return await _context.Documents
            .OrderByDescending(d => d.Date)
            .ToListAsync();
    }

    // =========================================================
    // GET: api/Documents/5
    // =========================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<Document>> GetById(int id)
    {
        var document = await _context.Documents.FindAsync(id);

        if (document == null)
            return NotFound();

        return Ok(document);
    }

    // =========================================================
    // POST: api/Documents
    // Create document + upload file
    // =========================================================
    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<ActionResult<Document>> Create(
        [FromForm] Document document,
        IFormFile? file)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // ✅ FIX: Convert date to UTC
        if (document.Date.Kind != DateTimeKind.Utc)
        {
            document.Date = DateTime.SpecifyKind(document.Date, DateTimeKind.Utc);
        }

        // -----------------------------------------------------
        // Upload file
        // -----------------------------------------------------
        if (file != null && file.Length > 0)
        {
            var uploadResult = await SaveFileAsync(file);

            if (!uploadResult.Success)
                return BadRequest(uploadResult.ErrorMessage);

            document.FilePath = uploadResult.FilePath!;
            document.FileSize = file.Length;
        }

        // -----------------------------------------------------
        // Dates
        // -----------------------------------------------------
        document.UploadDate = DateTime.UtcNow;
        document.CreatedAt = DateTime.UtcNow;

        // -----------------------------------------------------
        // Save database
        // -----------------------------------------------------
        _context.Documents.Add(document);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = document.Id },
            document
        );
    }

    // =========================================================
    // PUT: api/Documents/5
    // Update document + optional new file
    // =========================================================
    [HttpPut("{id}")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> Update(
        int id,
        [FromForm] Document document,
        IFormFile? file)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // ✅ FIX: Convert date to UTC
        if (document.Date.Kind != DateTimeKind.Utc)
        {
            document.Date = DateTime.SpecifyKind(document.Date, DateTimeKind.Utc);
        }

        var existingDocument =
            await _context.Documents.FindAsync(id);

        if (existingDocument == null)
            return NotFound();

        // -----------------------------------------------------
        // Update normal fields
        // -----------------------------------------------------
        existingDocument.Name = document.Name;
        existingDocument.Type = document.Type;
        existingDocument.Category = document.Category;
        existingDocument.Supplier = document.Supplier;
        existingDocument.Date = document.Date;
        existingDocument.Amount = document.Amount;
        existingDocument.Status = document.Status;
        existingDocument.Description = document.Description;

        // -----------------------------------------------------
        // Replace file only if a new file was uploaded
        // -----------------------------------------------------
        if (file != null && file.Length > 0)
        {
            // Delete old file
            DeletePhysicalFile(existingDocument.FilePath);

            // Save new file
            var uploadResult = await SaveFileAsync(file);

            if (!uploadResult.Success)
                return BadRequest(uploadResult.ErrorMessage);

            existingDocument.FilePath = uploadResult.FilePath!;
            existingDocument.FileSize = file.Length;

            // Update upload date because file changed
            existingDocument.UploadDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(existingDocument);
    }

    // =========================================================
    // DELETE: api/Documents/5
    // Delete database record + physical file
    // =========================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var document =
            await _context.Documents.FindAsync(id);

        if (document == null)
            return NotFound();

        // Delete physical file
        DeletePhysicalFile(document.FilePath);

        // Delete database record
        _context.Documents.Remove(document);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =========================================================
    // GET: api/Documents/category/Office%20Supplies
    // =========================================================
    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<Document>>> GetByCategory(
        string category)
    {
        return await _context.Documents
            .Where(d => d.Category == category)
            .OrderByDescending(d => d.Date)
            .ToListAsync();
    }

    // =========================================================
    // GET: api/Documents/download/5
    // Download document file
    // =========================================================
    [HttpGet("download/{id}")]
    public async Task<IActionResult> Download(int id)
    {
        var document =
            await _context.Documents.FindAsync(id);

        if (document == null)
            return NotFound("Document not found.");

        if (string.IsNullOrWhiteSpace(document.FilePath))
            return NotFound("This document has no file.");

        var fullPath = GetPhysicalFilePath(document.FilePath);

        if (string.IsNullOrWhiteSpace(fullPath) ||
            !System.IO.File.Exists(fullPath))
        {
            return NotFound("File not found on server.");
        }

        var contentType = GetContentType(fullPath);

        var fileName = Path.GetFileName(fullPath);

        return PhysicalFile(
            fullPath,
            contentType,
            fileName
        );
    }

    // =========================================================
    // Helper: Save uploaded file
    // =========================================================
    private async Task<FileUploadResult> SaveFileAsync(IFormFile file)
    {
        // -----------------------------------------------------
        // Allowed extensions
        // -----------------------------------------------------
        var allowedExtensions = new[]
        {
            ".pdf",
            ".xls",
            ".xlsx",
            ".doc",
            ".docx"
        };

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            return new FileUploadResult
            {
                Success = false,
                ErrorMessage =
                    "Only PDF, Excel and Word files are allowed."
            };
        }

        // -----------------------------------------------------
        // Maximum file size = 50 MB
        // -----------------------------------------------------
        const long maxFileSize = 50 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            return new FileUploadResult
            {
                Success = false,
                ErrorMessage =
                    "File size cannot exceed 50 MB."
            };
        }

        // -----------------------------------------------------
        // Upload directory
        // -----------------------------------------------------
        var webRoot =
            _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot =
                Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot"
                );
        }

        var uploadsFolder =
            Path.Combine(
                webRoot,
                "uploads",
                "documents"
            );

        Directory.CreateDirectory(uploadsFolder);

        // -----------------------------------------------------
        // Generate unique file name
        // -----------------------------------------------------
        var uniqueFileName =
            $"{Guid.NewGuid()}{extension}";

        var fullFilePath =
            Path.Combine(
                uploadsFolder,
                uniqueFileName
            );

        // -----------------------------------------------------
        // Save file
        // -----------------------------------------------------
        await using var stream =
            new FileStream(
                fullFilePath,
                FileMode.Create
            );

        await file.CopyToAsync(stream);

        // -----------------------------------------------------
        // Relative URL stored in database
        // -----------------------------------------------------
        var relativePath =
            $"/uploads/documents/{uniqueFileName}";

        return new FileUploadResult
        {
            Success = true,
            FilePath = relativePath
        };
    }

    // =========================================================
    // Helper: Delete physical file
    // =========================================================
    private void DeletePhysicalFile(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return;

        var fullPath =
            GetPhysicalFilePath(relativePath);

        if (!string.IsNullOrWhiteSpace(fullPath) &&
            System.IO.File.Exists(fullPath))
        {
            try
            {
                System.IO.File.Delete(fullPath);
            }
            catch
            {
                // Don't fail the database operation
                // if physical file deletion fails.
            }
        }
    }

    // =========================================================
    // Helper: Convert relative URL to physical path
    // =========================================================
    private string? GetPhysicalFilePath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return null;

        var webRoot =
            _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot =
                Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot"
                );
        }

        var cleanPath =
            relativePath
                .TrimStart('/')
                .Replace(
                    '/',
                    Path.DirectorySeparatorChar
                );
        return Path.Combine(
            webRoot,
            cleanPath
        );
    }

    // =========================================================
    // Helper: Determine file Content-Type
    // =========================================================
    private static string GetContentType(string filePath)
    {
        var extension =
            Path.GetExtension(filePath)
                .ToLowerInvariant();

        return extension switch
        {
            ".pdf" =>
                "application/pdf",

            ".doc" =>
                "application/msword",

            ".docx" =>
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            ".xls" =>
                "application/vnd.ms-excel",

            ".xlsx" =>
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ =>
                "application/octet-stream"
        };
    }

    // =========================================================
    // Internal result class
    // =========================================================
    private class FileUploadResult
    {
        public bool Success { get; set; }

        public string? FilePath { get; set; }

        public string? ErrorMessage { get; set; }
    }
}