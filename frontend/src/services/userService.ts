import api from "../api/axios";

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/Users");
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/Users/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<User, "id" | "createdAt"> & { password?: string }
  ): Promise<User> => {
    const response = await api.post("/Users", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<User> & { password?: string }
  ): Promise<User> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Users/${id}`, cleanData);
    return response.data;
  },

  resetPassword: async (
    id: number,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.put(`/Users/${id}/reset-password`, {
      newPassword,
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Users/${id}`);
  },
};