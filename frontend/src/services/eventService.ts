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
  createdAt: string;
}

export const eventService = {
  // Get all events
  getAll: async (): Promise<Event[]> => {
    const response = await api.get("/Events");
    return response.data;
  },

  // Get upcoming events
  getUpcoming: async (): Promise<Event[]> => {
    const response = await api.get("/Events/upcoming");
    return response.data;
  },

  // Create new event
  create: async (data: Omit<Event, "id" | "createdAt">): Promise<Event> => {
    const response = await api.post("/Events", data);
    return response.data;
  },

  // Update event
  update: async (id: number, data: Partial<Event>): Promise<Event> => {
    // ✅ Don't send id in the body
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Events/${id}`, cleanData);
    return response.data;
  },

  // Delete event
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Events/${id}`);
  },
};