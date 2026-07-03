export class GoogleSignInError extends Error {
  code: "FAILED";

  constructor(message: string) {
    super(message);
    this.name = "GoogleSignInError";
    this.code = "FAILED";
  }
}

export async function signInWithGoogleProvider() {
  throw new GoogleSignInError("Google sign-in is only available in the native app.");
}
