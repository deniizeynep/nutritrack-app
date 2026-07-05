const productionApiUrl = "https://nutritrack-api-tyaz.onrender.com/api";

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? productionApiUrl,
};
