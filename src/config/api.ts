const localApiUrl = "http://localhost:5000/api";

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || localApiUrl,
};
