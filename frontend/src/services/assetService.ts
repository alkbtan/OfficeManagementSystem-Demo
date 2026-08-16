import api from "../api/axios";

export interface Asset {
  id: number;
  name: string;
  type: "Computer" | "Printer" | "Monitor" | "Server" | "Other";
  model: string;
  serialNumber: string;
  status: "Available" | "In Use" | "Maintenance" | "Retired";
  assignedTo?: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  createdAt: string;
}

export const assetService = {
  getAll: async (): Promise<Asset[]> => {
    const response = await api.get("/Assets");
    return response.data;
  },

  getById: async (id: number): Promise<Asset> => {
    const response = await api.get(`/Assets/${id}`);
    return response.data;
  },

  create: async (data: Omit<Asset, "id" | "createdAt">): Promise<Asset> => {
    // Format dates properly
    const dataToSend = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : new Date().toISOString(),
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry).toISOString() : null,
    };
    const response = await api.post("/Assets", dataToSend);
    return response.data;
  },

  update: async (id: number, data: Partial<Asset>): Promise<Asset> => {
    const response = await api.put(`/Assets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Assets/${id}`);
  },

  getStats: async (): Promise<{ total: number; available: number; inUse: number; maintenance: number }> => {
    const response = await api.get("/Assets/stats");
    return response.data;
  },
};