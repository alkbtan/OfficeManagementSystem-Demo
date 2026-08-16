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

    public DocumentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Document>>> GetAll()
    {
        return await _context.Documents
            .OrderByDescending(d => d.UploadDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Document>> GetById(int id)
    {
        var document = await _context.Documents.FindAsync(id);
        if (document == null)
            return NotFound();
        return document;
    }

    [HttpPost]
    public async Task<ActionResult<Document>> Create(Document document)
    {
        document.UploadDate = DateTime.UtcNow;
        document.CreatedAt = DateTime.UtcNow;
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return Ok(document);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Document document)
    {
        if (id != document.Id)
            return BadRequest();

        _context.Entry(document).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return Ok(document);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var document = await _context.Documents.FindAsync(id);
        if (document == null)
            return NotFound();

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<Document>>> GetByCategory(string category)
    {
        return await _context.Documents
            .Where(d => d.Category == category)
            .ToListAsync();
    }
}