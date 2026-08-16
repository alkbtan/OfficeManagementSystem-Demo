import api from "../api/axios";

export interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  type: "General" | "Team Building" | "Birthday" | "Anniversary" | "Welcome";
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
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

  create: async (data: Omit<Event, "id" | "createdAt">): Promise<Event> => {
    const response = await api.post("/Events", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Event>): Promise<Event> => {
    const response = await api.put(`/Events/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Events/${id}`);
  },
};