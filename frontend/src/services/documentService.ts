import api from "../api/axios";

export interface Document {
  id: number;
  name: string;
  type: string;
  category: string;
  supplier: string;
  date: string;
  amount: number;
  status: string;
  description: string;
  fileSize: number;
  filePath: string;
  uploadDate: string;
  createdAt: string;
}

export const documentService = {
  getAll: async (): Promise<Document[]> => {
    const response = await api.get("/Documents");
    return response.data;
  },

  getById: async (id: number): Promise<Document> => {
    const response = await api.get(`/Documents/${id}`);
    return response.data;
  },

  getByCategory: async (
    category: string
  ): Promise<Document[]> => {
    const response = await api.get(
      `/Documents/category/${encodeURIComponent(category)}`
    );

    return response.data;
  },

  create: async (
    data: FormData
  ): Promise<Document> => {
    const response = await api.post(
      "/Documents",
      data
    );

    return response.data;
  },

  update: async (
    id: number,
    data: FormData
  ): Promise<Document> => {
    const response = await api.put(
      `/Documents/${id}`,
      data
    );

    return response.data;
  },

  delete: async (
    id: number
  ): Promise<void> => {
    await api.delete(`/Documents/${id}`);
  },
};

export default documentService;