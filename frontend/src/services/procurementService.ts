import api from "../api/axios";

export interface ProcurementRequest {
  id: number;
  requestNumber: string;
  item: string;
  itemId: string;
  requesterName: string;
  department: string;
  floor: string;
  project: string;
  responsible: string;
  briefDescription: string;
  supplier: string;
  productLink: string;
  unitPrice: number;
  quantity: number;
  shippingCost: number;
  total: number;
  classification: string;
  paymentMethod: string;
  priority: string;
  status: string;
  formDate: string;
  purchaseDeadline: string | null;
  approvedBy: string;
  approvalDate: string | null;
  approvalDocumentPath: string;
  ticketLink: string;
  invoiceNumber: string;
  boletoDueDate: string | null;
  paymentDate: string | null;
  boletoFilePath: string;
  paymentReceiptPath: string;
  expectedDeliveryDate: string | null;
  purchaseDataFilePath: string;
  createdBy?: string;
  createdAt: string;
}

export const procurementService = {
  getAll: async (): Promise<ProcurementRequest[]> => {
    const response = await api.get("/Procurement");
    return response.data;
  },

  getById: async (id: number): Promise<ProcurementRequest> => {
    const response = await api.get(`/Procurement/${id}`);
    return response.data;
  },

  create: async (
    data: Partial<Omit<ProcurementRequest, "id" | "createdAt" | "createdBy">>
  ): Promise<ProcurementRequest> => {
    const response = await api.post("/Procurement", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<ProcurementRequest>
  ): Promise<ProcurementRequest> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Procurement/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Procurement/${id}`);
  },

  getStats: async (): Promise<{
    total: number;
    pending: number;
    approved: number;
    completed: number;
    totalAmount: number;
  }> => {
    const response = await api.get("/Procurement/stats");
    return response.data;
  },
};

export const getAllProcurementRequests = procurementService.getAll;