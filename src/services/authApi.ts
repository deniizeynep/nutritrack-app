import { apiRequest } from "./apiClient";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type EmailVerificationRequiredResponse = {
  requiresEmailVerification: true;
  email: string;
  message: string;
};

export type AuthResult = AuthResponse | EmailVerificationRequiredResponse;

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

export type VerifyEmailPayload = {
  email: string;
  code: string;
};

export const authApi = {
  register: (payload: RegisterPayload) => {
    return apiRequest<AuthResult>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login: (payload: LoginPayload) => {
    return apiRequest<AuthResult>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  verifyEmail: (payload: VerifyEmailPayload) => {
    return apiRequest<AuthResponse>("/auth/verify-email", {
      method: "POST",
      body: payload,
    });
  },

  resendVerification: (email: string) => {
    return apiRequest<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: { email },
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
