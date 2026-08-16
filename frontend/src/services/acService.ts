import api from "../api/axios";

export interface AirConditioner {
  id: number;
  name: string;
  location: string;
  brand: string;
  model: string;
  capacity: number;
  installationDate: string;
  status: "Operational" | "Under Maintenance" | "Faulty";
  lastMaintenance: string;
  totalMaintenanceCost: number;
  maintenanceCount: number;
  issues: ACIssue[];
  createdAt: string;
}

export interface ACIssue {
  id: number;
  acId: number;
  issueType: "Cooling" | "Noise" | "Water Leak" | "Electrical" | "Other";
  description: string;
  reportedDate: string;
  resolvedDate?: string;
  cost: number;
  status: "Open" | "In Progress" | "Resolved";
}

export const acService = {
  getAll: async (): Promise<AirConditioner[]> => {
    const response = await api.get("/ACs");
    return response.data;
  },

  getById: async (id: number): Promise<AirConditioner> => {
    const response = await api.get(`/ACs/${id}`);
    return response.data;
  },

  create: async (data: Omit<AirConditioner, "id" | "createdAt" | "issues" | "lastMaintenance" | "totalMaintenanceCost" | "maintenanceCount">): Promise<AirConditioner> => {
    const response = await api.post("/ACs", data);
    return response.data;
  },

  update: async (id: number, data: Partial<AirConditioner>): Promise<AirConditioner> => {
    const response = await api.put(`/ACs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ACs/${id}`);
  },

  getStats: async (): Promise<{
    total: number;
    operational: number;
    underMaintenance: number;
    faulty: number;
    totalMaintenanceCost: number;
  }> => {
    const response = await api.get("/ACs/stats");
    return response.data;
  },

  getIssues: async (acId: number): Promise<ACIssue[]> => {
    const response = await api.get(`/ACs/${acId}/issues`);
    return response.data;
  },

  addIssue: async (acId: number, issue: Omit<ACIssue, "id">): Promise<ACIssue> => {
    const response = await api.post(`/ACs/${acId}/issues`, issue);
    return response.data;
  },
};