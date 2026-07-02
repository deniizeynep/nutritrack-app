import { API_CONFIG } from "../config/api";

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
  analyzeFoodPhoto: async (imageUri: string, token?: string | null) => {
    const formData = new FormData();

    formData.append("photo", {
      uri: imageUri,
      name: "food-photo.jpg",
      type: "image/jpeg",
    } as unknown as Blob);

    const response = await fetch(`${API_CONFIG.baseUrl}/ai/analyze-food`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || "Photo analysis failed");
    }

    return data as FoodPhotoEstimate;
  },
};
