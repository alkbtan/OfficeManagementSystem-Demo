import api from "../api/axios";

export interface Sport {
  id: number;
  name: string;
  type: string;
  teams: string;
  nextMatch?: string;
  status: "Active" | "Completed" | "Upcoming";
  createdAt: string;
}

export const sportService = {
  getAll: async (): Promise<Sport[]> => {
    const response = await api.get("/Sports");
    return response.data;
  },

  getActive: async (): Promise<Sport[]> => {
    const response = await api.get("/Sports/active");
    return response.data;
  },

  create: async (data: Omit<Sport, "id" | "createdAt">): Promise<Sport> => {
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