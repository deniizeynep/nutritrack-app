import * as FileSystem from "expo-file-system/legacy";
import { API_CONFIG } from "../config/api";

export type FoodPhotoEstimate = {
  isFood?: boolean;
  message?: string;
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

function detectMimeTypeFromUri(imageUri: string) {
  const cleanUri = imageUri.split("?")[0] ?? imageUri;
  const extension = cleanUri.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

export const aiApi = {
  analyzeFoodPhoto: async (imageUri: string, token?: string | null) => {
    const mimeType = detectMimeTypeFromUri(imageUri);
    const uploadUrl = `${API_CONFIG.baseUrl}/ai/analyze-food`;

    const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageUri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "photo",
      mimeType,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    let data: unknown = null;

    try {
      data = uploadResult.body ? JSON.parse(uploadResult.body) : null;
    } catch {
      throw new Error("AI yanıtı okunamadı.");
    }

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String(data.message)
          : "Fotoğraf analizi yapılamadı.";

      throw new Error(message);
    }

    return data as FoodPhotoEstimate;
  },
};
