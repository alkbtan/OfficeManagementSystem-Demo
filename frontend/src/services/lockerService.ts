import api from "../api/axios";

export interface Locker {
  id: number;
  number: string;
  location: string;
  status: "Available" | "Occupied" | "Maintenance" | "Reserved";
  assignedTo?: number;
  assignedToName?: string;
  lockType: "Key" | "Combination" | "Biometric";
  biometricEnabled: boolean;
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

  create: async (data: Omit<Locker, "id" | "createdAt">): Promise<Locker> => {
    // Ensure assignedTo is null if empty
    const dataToSend = {
      ...data,
      assignedTo: data.assignedTo || null,
    };
    const response = await api.post("/Lockers", dataToSend);
    return response.data;
  },

  update: async (id: number, data: Partial<Locker>): Promise<Locker> => {
    const response = await api.put(`/Lockers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Lockers/${id}`);
  },

  getStats: async (): Promise<{
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    reserved: number;
    neededLockers: number;
  }> => {
    const response = await api.get("/Lockers/stats");
    return response.data;
  },

  assignLocker: async (lockerId: number, employeeId: number): Promise<void> => {
    await api.post(`/Lockers/${lockerId}/assign`, { employeeId });
  },

  toggleBiometric: async (lockerId: number): Promise<void> => {
    await api.post(`/Lockers/${lockerId}/biometric`);
  },
};