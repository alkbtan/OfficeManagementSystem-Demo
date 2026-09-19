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
  createdBy?: string;
  createdAt: string;
}

export const lockerService = {
  getAll: async (): Promise<Locker[]> => {
    const response = await api.get("/Lockers");
    return response.data;
  },

  getById: async (id: number): Promise<Locker> => {
    const response = await api.get(`/Lockers/${id}`);
    return response.data;
  },

  create: async (data: Omit<Locker, "id" | "createdAt" | "createdBy">): Promise<Locker> => {
    const response = await api.post("/Lockers", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Locker>): Promise<Locker> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Lockers/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Lockers/${id}`);
  },
};