import api from "../api/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const userService = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/Users");
    return response.data;
  },

  // Get user by ID
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/Users/${id}`);
    return response.data;
  },

  // Create new user
  create: async (data: Omit<User, "id" | "createdAt"> & { password?: string }): Promise<User> => {
    const response = await api.post("/Users", data);
    return response.data;
  },

  // Update user
  update: async (id: number, data: Partial<User> & { password?: string }): Promise<User> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Users/${id}`, cleanData);
    return response.data;
  },

  // Reset password
  resetPassword: async (id: number, newPassword: string): Promise<{ message: string }> => {
    const response = await api.put(`/Users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  // Delete user
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Users/${id}`);
  },
};