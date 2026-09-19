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
  createdBy?: string;
  createdAt: string;
}

export const ticketService = {
  getAll: async (): Promise<Ticket[]> => {
    const response = await api.get("/Tickets");
    return response.data;
  },

  getById: async (id: number): Promise<Ticket> => {
    const response = await api.get(`/Tickets/${id}`);
    return response.data;
  },

  create: async (data: Omit<Ticket, "id" | "createdAt" | "createdBy">): Promise<Ticket> => {
    const response = await api.post("/Tickets", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Ticket>): Promise<Ticket> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Tickets/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Tickets/${id}`);
  },
};