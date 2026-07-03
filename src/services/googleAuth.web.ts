export class GoogleSignInError extends Error {
  code: "FAILED" | "UNAVAILABLE";

  constructor(message: string) {
    super(message);
    this.name = "GoogleSignInError";
    this.code = "FAILED";
  }
}

export function isGoogleSignInAvailable() {
  return false;
}

export function isExpoGoBuild() {
  return false;
}

export async function signInWithGoogleProvider() {
  throw new GoogleSignInError("Google sign-in is only available in the native app.");
}
