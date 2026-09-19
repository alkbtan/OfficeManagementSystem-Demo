import api from "../api/axios";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: string;
  location: string;
  birthday: string;
  createdBy?: string;
  createdAt: string;
}

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get("/Employees");
  return response.data;
};

// Get employee by ID
export const getEmployeeById = async (id: number): Promise<Employee> => {
  const response = await api.get(`/Employees/${id}`);
  return response.data;
};

// Create new employee
export const createEmployee = async (
  data: Omit<Employee, "id" | "createdAt" | "createdBy">
): Promise<Employee> => {
  const response = await api.post("/Employees", data);
  return response.data;
};

// Update employee
export const updateEmployee = async (
  id: number,
  data: Partial<Employee>
): Promise<Employee> => {
  const { id: _, ...cleanData } = data;
  const response = await api.put(`/Employees/${id}`, cleanData);
  return response.data;
};

// Delete employee
export const deleteEmployee = async (id: number): Promise<void> => {
  await api.delete(`/Employees/${id}`);
};