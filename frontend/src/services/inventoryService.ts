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
  lastUpdated: string;
}

export const inventoryService = {
  // Get all inventory items
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await api.get("/Inventory");
    return response.data;
  },

  // Get item by ID
  getById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get(`/Inventory/${id}`);
    return response.data;
  },

  // Create new inventory item
  create: async (data: Omit<InventoryItem, "id" | "lastUpdated">): Promise<InventoryItem> => {
    const response = await api.post("/Inventory", data);
    return response.data;
  },

  // Update inventory item
  update: async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
    // ✅ Remove id from data
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Inventory/${id}`, cleanData);
    return response.data;
  },

  // Delete inventory item
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Inventory/${id}`);
  },

  // Get inventory statistics
  getStats: async (): Promise<{ total: number; lowStock: number; outOfStock: number; categories: number }> => {
    const response = await api.get("/Inventory/stats");
    return response.data;
  },

  // Get low stock items
  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await api.get("/Inventory/low-stock");
    return response.data;
  },
};