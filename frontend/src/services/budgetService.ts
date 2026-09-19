import api from "../api/axios";

export interface Budget {
  id: number;
  category: string;
  planned: number;
  spent: number;
  year: number;
  month: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  planned: number;
  spent: number;
  remaining: number;
  categories: {
    category: string;
    planned: number;
    spent: number;
  }[];
}

export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    const response = await api.get("/Budget");
    return response.data;
  },

  getSummary: async (): Promise<BudgetSummary> => {
    const response = await api.get("/Budget/summary");
    return response.data;
  },

  create: async (
    data: Omit<Budget, "id" | "createdAt" | "updatedAt" | "createdBy">
  ): Promise<Budget> => {
    const response = await api.post("/Budget", data);
    return response.data;
  },

  update: async (id: number, data: Partial<Budget>): Promise<Budget> => {
    const response = await api.put(`/Budget/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Budget/${id}`);
  },
};