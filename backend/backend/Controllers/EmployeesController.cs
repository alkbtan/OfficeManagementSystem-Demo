using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeManagementAPI.Data;
using OfficeManagementAPI.Models;

namespace OfficeManagementAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmployeesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Employees
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Employee>>> GetAll()
    {
        return await _context.Employees
            .OrderBy(e => e.FirstName)
            .ToListAsync();
    }

    // GET: api/Employees/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetById(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
            return NotFound();
        return employee;
    }

    // POST: api/Employees
    [HttpPost]
    public async Task<ActionResult<Employee>> Create([FromBody] Employee employee)
    {
        if (string.IsNullOrWhiteSpace(employee.FirstName))
            return BadRequest(new { message = "First Name is required" });

        if (string.IsNullOrWhiteSpace(employee.LastName))
            return BadRequest(new { message = "Last Name is required" });

        if (string.IsNullOrWhiteSpace(employee.Email))
            return BadRequest(new { message = "Email is required" });

        if (string.IsNullOrWhiteSpace(employee.Department))
            return BadRequest(new { message = "Department is required" });

        employee.CreatedAt = DateTime.UtcNow;
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return Ok(employee);
    }

    // PUT: api/Employees/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Employee employee)
    {
        // Check if employee exists
        var existingEmployee = await _context.Employees.FindAsync(id);
        if (existingEmployee == null)
            return NotFound(new { message = "Employee not found" });

        // Validate required fields
        if (string.IsNullOrWhiteSpace(employee.FirstName))
            return BadRequest(new { message = "First Name is required" });

        if (string.IsNullOrWhiteSpace(employee.LastName))
            return BadRequest(new { message = "Last Name is required" });

        if (string.IsNullOrWhiteSpace(employee.Email))
            return BadRequest(new { message = "Email is required" });

        if (string.IsNullOrWhiteSpace(employee.Department))
            return BadRequest(new { message = "Department is required" });

        // Update fields
        existingEmployee.FirstName = employee.FirstName;
        existingEmployee.LastName = employee.LastName;
        existingEmployee.Email = employee.Email;
        existingEmployee.Department = employee.Department;
        existingEmployee.Status = employee.Status;
        existingEmployee.Location = employee.Location ?? string.Empty;
        existingEmployee.Birthday = employee.Birthday;

        await _context.SaveChangesAsync();

        return Ok(existingEmployee);
    }

    // DELETE: api/Employees/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
            return NotFound();

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Employees/department/{department}
    [HttpGet("department/{department}")]
    public async Task<ActionResult<IEnumerable<Employee>>> GetByDepartment(string department)
    {
        return await _context.Employees
            .Where(e => e.Department == department)
            .OrderBy(e => e.FirstName)
            .ToListAsync();
    }

    // GET: api/Employees/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Employees.CountAsync();
        var active = await _context.Employees.CountAsync(e => e.Status == "Active");
        var departments = await _context.Employees.Select(e => e.Department).Distinct().CountAsync();

        return Ok(new { total, active, departments });
    }
}