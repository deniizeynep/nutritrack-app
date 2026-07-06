import Constants from "expo-constants";
import { Platform } from "react-native";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const isExpoGo = Constants.appOwnership === "expo";

let isConfigured = false;

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

export class GoogleSignInError extends Error {
  code:
    | "CANCELLED"
    | "UNAVAILABLE"
    | "MISSING_WEB_CLIENT_ID"
    | "PLAY_SERVICES_NOT_AVAILABLE"
    | "MISSING_ID_TOKEN"
    | "FAILED";

  constructor(
    code:
      | "UNAVAILABLE"
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

export function isGoogleSignInAvailable() {
  return !isExpoGo;
}

export function hasGoogleSignInConfig() {
  return Boolean(webClientId);
}

export function isExpoGoBuild() {
  return isExpoGo;
}

export function getGoogleSignInDebugInfo() {
  return {
    appOwnership: Constants.appOwnership,
    hasWebClientId: Boolean(webClientId),
    isExpoGo,
    platform: Platform.OS,
  };
}

function configureGoogleSigninModule(
  GoogleSignin: GoogleSigninModule["GoogleSignin"],
) {
  if (isConfigured) {
    return;
  }

  if (!webClientId) {
    throw new GoogleSignInError(
      "MISSING_WEB_CLIENT_ID",
      "Google sign-in is not configured.",
    );
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });

  isConfigured = true;
}

export async function configureGoogleSignIn() {
  if (isExpoGo) {
    throw new GoogleSignInError(
      "UNAVAILABLE",
      "Google sign-in is unavailable in Expo Go.",
    );
  }

  const { GoogleSignin } = (await import(
    "@react-native-google-signin/google-signin"
  )) as GoogleSigninModule;

  configureGoogleSigninModule(GoogleSignin);
}

function normalizeSignInError(
  error: unknown,
  isErrorWithCode: GoogleSigninModule["isErrorWithCode"],
  statusCodes: GoogleSigninModule["statusCodes"],
) {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return new GoogleSignInError("CANCELLED", "Google sign-in cancelled.");
    }

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
  if (__DEV__) {
    console.info("Google Sign-In availability", getGoogleSignInDebugInfo());
  }

  if (isExpoGo) {
    throw new GoogleSignInError(
      "UNAVAILABLE",
      "Google sign-in is unavailable in Expo Go.",
    );
  }

  if (!webClientId) {
    throw new GoogleSignInError(
      "MISSING_WEB_CLIENT_ID",
      "Google sign-in is not configured.",
    );
  }

  const { GoogleSignin, isErrorWithCode, statusCodes } = (await import(
    "@react-native-google-signin/google-signin"
  )) as GoogleSigninModule;

  configureGoogleSigninModule(GoogleSignin);

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

    throw normalizeSignInError(error, isErrorWithCode, statusCodes);
  }
}

export async function signInWithGoogle() {
  return signInWithGoogleProvider();
}
