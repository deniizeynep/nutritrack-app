import { apiRequest } from "./apiClient";

export type FoodPhotoEstimate = {
  foodName: {
    tr: string;
    en: string;
  };
  portion?: {
    tr: string;
    en: string;
  };
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  source: "mock" | "ai";
};

export const aiApi = {
  analyzeFoodPhoto: (imageUri: string) => {
    return apiRequest<FoodPhotoEstimate>("/ai/analyze-food", {
      method: "POST",
      body: {
        imageUri,
      },
    });
  },
};
