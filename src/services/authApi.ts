import { apiRequest } from "./apiClient";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type GoogleSignInPayload = {
  idToken: string;
};

export const authApi = {
  register: (payload: RegisterPayload) => {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login: (payload: LoginPayload) => {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  signInWithGoogle: (idToken: string) => {
    return apiRequest<AuthResponse>("/auth/google", {
      method: "POST",
      body: {
        idToken,
      } satisfies GoogleSignInPayload,
    });
  },

  me: (token: string) => {
    return apiRequest<MeResponse>("/auth/me", {
      token,
    });
  },

  deleteAccount: (token: string) => {
    return apiRequest<{ message: string }>("/auth/me", {
      method: "DELETE",
      token,
    });
  },
};
