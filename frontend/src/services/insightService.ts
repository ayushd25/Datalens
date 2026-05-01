import { api } from "./api";

export const insightService = {
  generate: (datasetId: string) =>
    api.post(`/insights/${datasetId}/generate`),

  list: (datasetId?: string) =>
    api.get("/insights", { params: datasetId ? { datasetId } : {} }),

  get: (id: string) =>
    api.get(`/insights/${id}`),

  delete: (id: string) =>
    api.delete(`/insights/${id}`),
};