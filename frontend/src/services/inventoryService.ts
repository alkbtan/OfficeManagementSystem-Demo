import api from "../api/axios";

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  supplier: string;
  purchaseDate: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  createdBy?: string;
  lastUpdated: string;
}

export const inventoryService = {
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await api.get("/Inventory");
    return response.data;
  },

  getById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get(`/Inventory/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<InventoryItem, "id" | "lastUpdated" | "createdBy">
  ): Promise<InventoryItem> => {
    const response = await api.post("/Inventory", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<InventoryItem>
  ): Promise<InventoryItem> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Inventory/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Inventory/${id}`);
  },

  getStats: async (): Promise<{
    total: number;
    lowStock: number;
    outOfStock: number;
    categories: number;
  }> => {
    const response = await api.get("/Inventory/stats");
    return response.data;
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await api.get("/Inventory/low-stock");
    return response.data;
  },
};