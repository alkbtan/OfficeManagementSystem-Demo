import api from "../api/axios";

export interface Sport {
  id: number;
  name: string;
  date: string;
  time: string;
  preparation: string;
  equipment: string;
  status: "Pending" | "Preparing" | "Ready" | "Completed";
  createdAt: string;
}

export const sportService = {
  // Get all sports
  getAll: async (): Promise<Sport[]> => {
    const response = await api.get("/Sports");
    return response.data;
  },

  // Get sport by ID
  getById: async (id: number): Promise<Sport> => {
    const response = await api.get(`/Sports/${id}`);
    return response.data;
  },

  // Create new sport
  create: async (data: Omit<Sport, "id" | "createdAt">): Promise<Sport> => {
    const response = await api.post("/Sports", data);
    return response.data;
  },

  // Update sport
  update: async (id: number, data: Partial<Sport>): Promise<Sport> => {
    const response = await api.put(`/Sports/${id}`, data);
    return response.data;
  },

  // Delete sport
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Sports/${id}`);
  },
};