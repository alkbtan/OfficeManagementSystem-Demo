import api from "../api/axios";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Closed";
  priority: "Low" | "Medium" | "High";
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export const ticketService = {
  // Get all tickets
  getAll: async (): Promise<Ticket[]> => {
    const response = await api.get("/Tickets");
    return response.data;
  },
  
  // Get ticket by ID
  getById: async (id: number): Promise<Ticket> => {
    const response = await api.get(`/Tickets/${id}`);
    return response.data;
  },
  
  // Create new ticket
  create: async (data: Omit<Ticket, "id" | "createdAt">): Promise<Ticket> => {
    const response = await api.post("/Tickets", data);
    return response.data;
  },
  
  // Update ticket
  update: async (id: number, data: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.put(`/Tickets/${id}`, data);
    return response.data;
  },
  
  // Delete ticket
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Tickets/${id}`);
  },
  
  // Get ticket statistics
  getStats: async (): Promise<{ total: number; open: number; inProgress: number; closed: number }> => {
    const response = await api.get("/Tickets/stats");
    return response.data;
  }
};