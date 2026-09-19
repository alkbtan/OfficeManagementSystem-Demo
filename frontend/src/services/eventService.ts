import api from "../api/axios";

export interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  time: string;
  location: string;
  type: string;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
  preparation: string;
  equipment: string;
  createdBy?: string;
  createdAt: string;
}

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get("/Events");
    return response.data;
  },

  getUpcoming: async (): Promise<Event[]> => {
    const response = await api.get("/Events/upcoming");
    return response.data;
  },

  create: async (data: Omit<Event, "id" | "createdAt" | "createdBy">): Promise<Event> => {
    const response = await api.post("/Events", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Event>): Promise<Event> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Events/${id}`, cleanData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Events/${id}`);
  },
};