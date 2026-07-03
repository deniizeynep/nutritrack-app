import { API_CONFIG } from "../config/api";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = {
  method?: ApiMethod;
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  let data: { message?: string } | null = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Bir şeyler ters gitti. Lütfen tekrar dene.");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Bir şeyler ters gitti. Lütfen tekrar dene.");
  }

  return data as T;
}
