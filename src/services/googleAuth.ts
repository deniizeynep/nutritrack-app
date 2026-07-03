import { GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

let isConfigured = false;

export class GoogleSignInError extends Error {
  code:
    | "CANCELLED"
    | "MISSING_WEB_CLIENT_ID"
    | "PLAY_SERVICES_NOT_AVAILABLE"
    | "MISSING_ID_TOKEN"
    | "FAILED";

  constructor(
    code:
      | "CANCELLED"
      | "MISSING_WEB_CLIENT_ID"
      | "PLAY_SERVICES_NOT_AVAILABLE"
      | "MISSING_ID_TOKEN"
      | "FAILED",
    message: string,
  ) {
    super(message);
    this.name = "GoogleSignInError";
    this.code = code;
  }
}

function configureGoogleSignin() {
  if (isConfigured) {
    return;
  }

  if (!webClientId) {
    return;
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });

  isConfigured = true;
}

function normalizeSignInError(error: unknown) {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return new GoogleSignInError(
        "PLAY_SERVICES_NOT_AVAILABLE",
        "Google Play Services may not be available on this device.",
      );
    }
  }

  if (error instanceof Error && error.message.toLowerCase().includes("cancel")) {
    return new GoogleSignInError("CANCELLED", error.message);
  }

  return new GoogleSignInError(
    "FAILED",
    error instanceof Error ? error.message : "Google sign-in failed.",
  );
}

export async function signInWithGoogleProvider() {
  if (!webClientId) {
    throw new GoogleSignInError(
      "MISSING_WEB_CLIENT_ID",
      "Google sign-in is not configured.",
    );
  }

  configureGoogleSignin();

  try {
    const hasPlayServices = await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    if (!hasPlayServices) {
      throw new GoogleSignInError(
        "PLAY_SERVICES_NOT_AVAILABLE",
        "Google Play Services may not be available on this device.",
      );
    }

    const response = await GoogleSignin.signIn();

    if (response.type !== "success") {
      throw new GoogleSignInError("CANCELLED", "Google sign-in cancelled.");
    }

    const idToken = response.data.idToken;

    if (!idToken) {
      throw new GoogleSignInError(
        "MISSING_ID_TOKEN",
        "Google sign-in did not return an ID token.",
      );
    }

    return {
      idToken,
      user: response.data.user,
    };
  } catch (error) {
    if (error instanceof GoogleSignInError) {
      throw error;
    }

    throw normalizeSignInError(error);
  }
}
