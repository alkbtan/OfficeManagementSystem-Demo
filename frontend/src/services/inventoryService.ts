import api from "../api/axios";

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  purchasePrice: number;
  consumption: number; // الاستهلاك الفعلي
  lastUpdated: string;
}

export interface PurchaseVsConsumption {
  month: string;
  purchase: number;
  consumption: number;
}

export const inventoryService = {
  // Fetch all items
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await api.get("/Inventory");
    return response.data;
  },

  // Fetch purchase vs consumption statistics
  getPurchaseVsConsumption: async (): Promise<PurchaseVsConsumption[]> => {
    const response = await api.get("/Inventory/purchase-vs-consumption");
    return response.data;
  },

  // Update item quantity
  updateQuantity: async (id: number, quantity: number): Promise<void> => {
    await api.put(`/Inventory/${id}/quantity`, { quantity });
  },

  // Fetch items that have reached reorder point
  getLowStock: async (): Promise<InventoryItem[]> => {
    const response = await api.get("/Inventory/low-stock");
    return response.data;
  },
};