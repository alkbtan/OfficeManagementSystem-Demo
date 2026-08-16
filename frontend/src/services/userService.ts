import api from "../api/axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "User";
  status: "Active" | "Inactive";
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
  create: async (data: Omit<User, "id" | "createdAt"> & { password: string }): Promise<User> => {
    const response = await api.post("/Users", data);
    return response.data;
  },

  // Update user
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/Users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Users/${id}`);
  },

  // Get user statistics
  getStats: async (): Promise<{ total: number; active: number; inactive: number; admins: number }> => {
    const response = await api.get("/Users/stats");
    return response.data;
  }
};