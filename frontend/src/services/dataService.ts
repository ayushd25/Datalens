// frontend/src/services/dataService.ts
import { api } from "./api";

export const dataService = {
  getChartData: (datasetId: string, column: string, chartType: string) => {
    return api.get(`/data/${datasetId}/charts`, {
      params: { column, chartType },
    });
  },
};