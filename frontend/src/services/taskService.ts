import api from "../api/axios";

export interface TodoTask {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  category: "Work" | "Personal" | "Urgent";
  dueDate: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  urgent: number;
  high: number;
}

export const taskService = {
  // Get all tasks
  getAll: async (): Promise<TodoTask[]> => {
    const response = await api.get("/Tasks");
    return response.data;
  },

  // Get task by ID
  getById: async (id: number): Promise<TodoTask> => {
    const response = await api.get(`/Tasks/${id}`);
    return response.data;
  },

  // Create new task
  create: async (
    data: Omit<TodoTask, "id" | "createdAt" | "completedAt">
  ): Promise<TodoTask> => {
    const response = await api.post("/Tasks", data);
    return response.data;
  },

  // Update task
  update: async (
    id: number,
    data: Partial<TodoTask>
  ): Promise<TodoTask> => {
    const { id: _, ...cleanData } = data;
    const response = await api.put(`/Tasks/${id}`, cleanData);
    return response.data;
  },

  // Toggle complete
  toggle: async (id: number): Promise<TodoTask> => {
    const response = await api.put(`/Tasks/${id}/toggle`);
    return response.data;
  },

  // Delete task
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Tasks/${id}`);
  },

  // Get stats
  getStats: async (): Promise<TaskStats> => {
    const response = await api.get("/Tasks/stats");
    return response.data;
  },
};