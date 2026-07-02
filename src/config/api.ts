const localApiUrl = "http://localhost:5000/api";

export const API_CONFIG = {
  // Physical devices cannot reach your computer via localhost.
  // Use EXPO_PUBLIC_API_URL for LAN testing and the live backend URL in production builds.
  baseUrl: process.env.EXPO_PUBLIC_API_URL || localApiUrl,
};
