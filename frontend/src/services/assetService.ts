import api from "../api/axios";

export interface Asset {
  id: number;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  status: string;
  assignedTo: string;
  location: string;
  createdAt: string;
}

export const assetService = {
  // Get all assets
  getAll: async (): Promise<Asset[]> => {
    const response = await api.get("/Assets");
    return response.data;
  },

  // Get asset by ID
  getById: async (id: number): Promise<Asset> => {
    const response = await api.get(`/Assets/${id}`);
    return response.data;
  },

  // Create new asset
  create: async (data: Omit<Asset, "id" | "createdAt">): Promise<Asset> => {
    const response = await api.post("/Assets", data);
    return response.data;
  },

  // Update asset
  update: async (id: number, data: Partial<Asset>): Promise<Asset> => {
    // ✅ Remove id from data
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Assets/${id}`, cleanData);
    return response.data;
  },

  // Delete asset
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Assets/${id}`);
  },
};