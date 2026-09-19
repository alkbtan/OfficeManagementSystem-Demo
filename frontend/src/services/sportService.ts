import api from "../api/axios";

export interface Sport {
  id: number;
  name: string;
  date: string;
  time: string;
  preparation: string;
  equipment: string;
  status: "Pending" | "Preparing" | "Ready" | "Completed";
  createdBy?: string;
  createdAt: string;
}

export const sportService = {
  getAll: async (): Promise<Sport[]> => {
    const response = await api.get("/Sports");
    return response.data;
  },

  getById: async (id: number): Promise<Sport> => {
    const response = await api.get(`/Sports/${id}`);
    return response.data;
  },

  create: async (data: Omit<Sport, "id" | "createdAt" | "createdBy">): Promise<Sport> => {
    const response = await api.post("/Sports", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Sport>): Promise<Sport> => {
    const response = await api.put(`/Sports/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Sports/${id}`);
  },
};