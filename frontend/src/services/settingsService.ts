import api from "../api/axios";

export interface Setting {
  id?: number;
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
}

export const settingsService = {
  getAll: async (): Promise<Setting[]> => {
    const response = await api.get("/Settings");
    return response.data;
  },

  getByCategory: async (category: string): Promise<Setting[]> => {
    const response = await api.get(`/Settings/category/${category}`);
    return response.data;
  },

  getByKey: async (key: string): Promise<Setting> => {
    const response = await api.get(`/Settings/${key}`);
    return response.data;
  },

  createOrUpdate: async (setting: Setting): Promise<Setting> => {
    const response = await api.post("/Settings", setting);
    return response.data;
  },

  bulkUpdate: async (settings: Setting[]): Promise<void> => {
    await api.post("/Settings/bulk", settings);
  },

  delete: async (key: string): Promise<void> => {
    await api.delete(`/Settings/${key}`);
  },

  resetToDefaults: async (): Promise<void> => {
    await api.post("/Settings/reset");
  },
};