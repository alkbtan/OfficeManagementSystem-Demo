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
    public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
    {
        var employees = await _context.Employees
            .OrderBy(e => e.Id)
            .ToListAsync();

        return Ok(employees);
    }

    // GET: api/Employees/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound();

        return Ok(employee);
    }

    // POST: api/Employees
    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] Employee employee)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        employee.CreatedAt = DateTime.UtcNow;

        _context.Employees.Add(employee);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetEmployee),
            new { id = employee.Id },
            employee);
    }

    // PUT: api/Employees/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] Employee employee)
    {
        // Validate ID match
        if (id != employee.Id)
            return BadRequest(new { message = "ID mismatch" });

        // Check if employee exists
        var existingEmployee = await _context.Employees.FindAsync(id);
        if (existingEmployee == null)
            return NotFound(new { message = "Employee not found" });

        // Update only the fields that can be changed
        existingEmployee.FirstName = employee.FirstName;
        existingEmployee.LastName = employee.LastName;
        existingEmployee.Email = employee.Email;
        existingEmployee.Department = employee.Department;
        existingEmployee.Status = employee.Status;

        await _context.SaveChangesAsync();

        return Ok(existingEmployee);
    }

    // DELETE: api/Employees/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees.FindAsync(id);

        if (employee == null)
            return NotFound();

        _context.Employees.Remove(employee);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Employees/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var total = await _context.Employees.CountAsync();
        var departments = await _context.Employees
            .Select(e => e.Department)
            .Distinct()
            .CountAsync();
        var active = await _context.Employees.CountAsync(e => e.Status == "Active");
        var inactive = await _context.Employees.CountAsync(e => e.Status != "Active");

        return Ok(new { total, departments, active, inactive });
    }
}