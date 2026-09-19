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
  createdBy?: string;
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

  create: async (data: Omit<Asset, "id" | "createdAt" | "createdBy">): Promise<Asset> => {
    const response = await api.post("/Assets", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Asset>): Promise<Asset> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Assets/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Assets/${id}`);
  },
};