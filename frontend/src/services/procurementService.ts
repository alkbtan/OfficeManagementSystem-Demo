import api from "../api/axios";

export interface ProcurementRequest {
  id: number;
  requestNumber: string;
  department: string;
  requester: string;
  vendor: string;
  items: string;
  totalAmount: number;
  status: "Pending" | "Approved" | "Rejected" | "In Progress";
  priority: "Low" | "Medium" | "High";
  requestDate: string;
  approvedDate?: string;
  approvedBy?: string;
  createdAt: string;
}

// Get all procurement requests
export const getAllProcurementRequests = async (): Promise<ProcurementRequest[]> => {
  const response = await api.get("/Procurement");
  return response.data;
};

// Get procurement request by ID
export const getProcurementRequestById = async (id: number): Promise<ProcurementRequest> => {
  const response = await api.get(`/Procurement/${id}`);
  return response.data;
};

// Create new procurement request
export const createProcurementRequest = async (
  data: Omit<ProcurementRequest, "id" | "requestNumber" | "requestDate" | "createdAt">
): Promise<ProcurementRequest> => {
  const response = await api.post("/Procurement", data);
  return response.data;
};

// ✅ Update procurement request - Fixed (removes id from body)
export const updateProcurementRequest = async (
  id: number,
  data: Partial<ProcurementRequest>
): Promise<ProcurementRequest> => {
  // Remove id from data to avoid conflicts
  const { id: _, ...cleanData } = data;
  const response = await api.put(`/Procurement/${id}`, cleanData);
  return response.data;
};

// Delete procurement request
export const deleteProcurementRequest = async (id: number): Promise<void> => {
  await api.delete(`/Procurement/${id}`);
};

// Approve procurement request
export const approveProcurementRequest = async (id: number, approvedBy: string): Promise<ProcurementRequest> => {
  const response = await api.post(`/Procurement/${id}/approve`, { approvedBy });
  return response.data;
};

// Get procurement statistics
export const getProcurementStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}> => {
  const response = await api.get("/Procurement/stats");
  return response.data;
};