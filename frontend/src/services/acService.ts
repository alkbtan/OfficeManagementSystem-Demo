import api from "../api/axios";

export interface AirConditioner {
  id: number;
  name: string;
  location: string;
  brand: string;
  model: string;
  capacity: number;
  installationDate: string;
  status: string;
  lastMaintenance: string;
  totalMaintenanceCost: number;
  maintenanceCount: number;
  createdAt: string;
}

export const acService = {
  // Get all AC units
  getAll: async (): Promise<AirConditioner[]> => {
    const response = await api.get("/AirConditioners");
    return response.data;
  },

  // Get AC unit by ID
  getById: async (id: number): Promise<AirConditioner> => {
    const response = await api.get(`/AirConditioners/${id}`);
    return response.data;
  },

  // Create new AC unit
  create: async (data: Omit<AirConditioner, "id" | "createdAt">): Promise<AirConditioner> => {
    const response = await api.post("/AirConditioners", data);
    return response.data;
  },

  // Update AC unit
  update: async (id: number, data: Partial<AirConditioner>): Promise<AirConditioner> => {
    // ✅ Remove id from data
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/AirConditioners/${id}`, cleanData);
    return response.data;
  },

  // Delete AC unit
  delete: async (id: number): Promise<void> => {
    await api.delete(`/AirConditioners/${id}`);
  },

  // Get AC statistics
  getStats: async (): Promise<{ total: number; operational: number; maintenance: number; totalCost: number }> => {
    const response = await api.get("/AirConditioners/stats");
    return response.data;
  },
};