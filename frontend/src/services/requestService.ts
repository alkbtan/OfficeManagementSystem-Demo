import api from "../api/axios";

export interface Request {
  id: number;
  type: "Procurement" | "Maintenance" | "Furniture" | "Lockers" | "Other";
  title: string;
  description: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
  date: string;
  priority: "Low" | "Medium" | "High";
  createdAt: string;
}

export const requestService = {
  getAll: async (): Promise<Request[]> => {
    const response = await api.get("/Requests");
    return response.data;
  },

  getById: async (id: number): Promise<Request> => {
    const response = await api.get(`/Requests/${id}`);
    return response.data;
  },

  create: async (data: Omit<Request, "id" | "createdAt" | "date">): Promise<Request> => {
    const response = await api.post("/Requests", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Request>): Promise<Request> => {
    const response = await api.put(`/Requests/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Requests/${id}`);
  },

  getStats: async (): Promise<{ total: number; pending: number; approved: number; rejected: number }> => {
    const response = await api.get("/Requests/stats");
    return response.data;
  }
};