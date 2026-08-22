import api from "../api/axios";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  jiraTicket: string;
  link: string;
  amount: number;
  date: string;
  floor: string;
  company: string;
  createdAt: string;
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

  // ✅ FIXED: Update ticket - don't send id in body
  update: async (id: number, data: Partial<Ticket>): Promise<Ticket> => {
    // Remove id from data if it exists
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Tickets/${id}`, cleanData);
    return response.data;
  },

  // Delete ticket
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Tickets/${id}`);
  },
};