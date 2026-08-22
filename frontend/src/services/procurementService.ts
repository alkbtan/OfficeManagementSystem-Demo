import api from "../api/axios";

export interface ProcurementRequest {
  id: number;
  requestNumber: string;
  department: string;
  requester: string;
  vendor: string;
  items: string;
  totalAmount: number;
  status: string;
  priority: string;
  requestDate: string;
  approvedDate: string;
  approvedBy: string;
  createdAt: string;
}

export const procurementService = {
  // Get all procurement requests
  getAll: async (): Promise<ProcurementRequest[]> => {
    const response = await api.get("/Procurement");
    return response.data;
  },

  // Get request by ID
  getById: async (id: number): Promise<ProcurementRequest> => {
    const response = await api.get(`/Procurement/${id}`);
    return response.data;
  },

  // Create new procurement request
  create: async (data: Omit<ProcurementRequest, "id" | "createdAt" | "approvedDate">): Promise<ProcurementRequest> => {
    const response = await api.post("/Procurement", data);
    return response.data;
  },

  // Update procurement request
  update: async (id: number, data: Partial<ProcurementRequest>): Promise<ProcurementRequest> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Procurement/${id}`, cleanData);
    return response.data;
  },

  // Delete procurement request
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Procurement/${id}`);
  },
};

// Export function for Reports
export const getAllProcurementRequests = procurementService.getAll;