import api from "../api/axios";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: string;
  createdAt: string;
}

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get<Employee[]>("/Employees");
  return response.data;
};

// Get employee by ID
export const getEmployeeById = async (id: number): Promise<Employee> => {
  const response = await api.get<Employee>(`/Employees/${id}`);
  return response.data;
};

// Add new employee
export const addEmployee = async (
  employee: Omit<Employee, "id" | "createdAt">
): Promise<Employee> => {
  const response = await api.post<Employee>("/Employees", employee);
  return response.data;
};

// Update employee
export const updateEmployee = async (
  id: number,
  employee: Partial<Employee>
): Promise<Employee> => {
  // Send the full employee data including id
  const response = await api.put<Employee>(`/Employees/${id}`, {
    id,
    ...employee
  });
  return response.data;
};

// Delete employee
export const deleteEmployee = async (id: number): Promise<void> => {
  await api.delete(`/Employees/${id}`);
};

// Get employee statistics
export const getEmployeesStats = async (): Promise<{
  total: number;
  departments: number;
  active: number;
  inactive: number;
}> => {
  try {
    const response = await api.get("/Employees/stats");
    return response.data;
  } catch (error) {
    // Fallback to calculate from employees data
    const employees = await getEmployees();
    const departments = new Set(employees.map(e => e.department)).size;
    const active = employees.filter(e => e.status === "Active").length;
    const inactive = employees.filter(e => e.status !== "Active").length;
    return {
      total: employees.length,
      departments,
      active,
      inactive
    };
  }
};