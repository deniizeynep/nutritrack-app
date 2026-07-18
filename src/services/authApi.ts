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
  emailChange: EmailChangeStatus | null;
};

export type EmailChangeStatus = {
  email: string;
  expiresAt: string;
  resendAvailableAt: string | null;
};

export type EmailChangeResponse = {
  emailChange: EmailChangeStatus;
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

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  newPassword: string;
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

  forgotPassword: (email: string) => {
    return apiRequest<{ message: string; email: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email } satisfies ForgotPasswordPayload,
    });
  },

  resetPassword: (payload: ResetPasswordPayload) => {
    return apiRequest<{ message: string }>("/auth/reset-password", {
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

  updateProfile: (fullName: string, token: string) => {
    return apiRequest<{ user: AuthUser }>("/auth/me", {
      method: "PATCH",
      body: { fullName },
      token,
    });
  },

  requestEmailChange: (email: string, token: string) => {
    return apiRequest<EmailChangeResponse>("/auth/me/email-change", {
      method: "POST",
      body: { email },
      token,
    });
  },

  verifyEmailChange: (code: string, token: string) => {
    return apiRequest<{ user: AuthUser; emailChange: null }>(
      "/auth/me/email-change/verify",
      {
        method: "POST",
        body: { code },
        token,
      },
    );
  },

  resendEmailChange: (token: string) => {
    return apiRequest<EmailChangeResponse>("/auth/me/email-change/resend", {
      method: "POST",
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
