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
  createdBy?: string;
  createdAt: string;
}

export const acService = {
  getAll: async (): Promise<AirConditioner[]> => {
    const response = await api.get("/AirConditioners");
    return response.data;
  },

  getById: async (id: number): Promise<AirConditioner> => {
    const response = await api.get(`/AirConditioners/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<AirConditioner, "id" | "createdAt" | "createdBy">
  ): Promise<AirConditioner> => {
    const response = await api.post("/AirConditioners", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<AirConditioner>
  ): Promise<AirConditioner> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/AirConditioners/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/AirConditioners/${id}`);
  },

  getStats: async (): Promise<{
    total: number;
    operational: number;
    maintenance: number;
    totalCost: number;
  }> => {
    const response = await api.get("/AirConditioners/stats");
    return response.data;
  },
};