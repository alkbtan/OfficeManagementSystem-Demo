import api from "../api/axios";

export interface Locker {
  id: number;
  number: string;
  location: string;
  status: string;
  lockType: string;
  assignedTo: string;
  assignedToName: string;
  biometricEnabled: boolean;
  createdAt: string;
}

export const lockerService = {
  // Get all lockers
  getAll: async (): Promise<Locker[]> => {
    const response = await api.get("/Lockers");
    return response.data;
  },

  // Get locker by ID
  getById: async (id: number): Promise<Locker> => {
    const response = await api.get(`/Lockers/${id}`);
    return response.data;
  },

  // Create new locker
  create: async (data: Omit<Locker, "id" | "createdAt">): Promise<Locker> => {
    const response = await api.post("/Lockers", data);
    return response.data;
  },

  // Update locker
  update: async (id: number, data: Partial<Locker>): Promise<Locker> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Lockers/${id}`, cleanData);
    return response.data;
  },

  // Delete locker
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Lockers/${id}`);
  },
};