type BrevoEmailPayload = {
  to: Array<{
    email: string;
  }>;
  subject: string;
  textContent: string;
  htmlContent: string;
};

const brevoEmailEndpoint = "https://api.brevo.com/v3/smtp/email";

function getEmailConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const fromName = process.env.EMAIL_FROM_NAME || "NutriTrack";
  const fromEmail = process.env.EMAIL_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing");
  }

  if (!fromEmail) {
    throw new Error("EMAIL_FROM_EMAIL is missing");
  }

  return {
    apiKey,
    fromName,
    fromEmail,
  };
}

async function readBrevoError(response: Response) {
  try {
    const body = (await response.json()) as { message?: unknown; code?: unknown };
    const message = typeof body.message === "string" ? body.message : null;
    const code = typeof body.code === "string" ? body.code : null;

    return [code, message].filter(Boolean).join(" - ") || response.statusText;
  } catch {
    return response.statusText;
  }
}

async function sendBrevoEmail(payload: BrevoEmailPayload) {
  const config = getEmailConfig();
  const response = await fetch(brevoEmailEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify({
      ...payload,
      sender: {
        name: config.fromName,
        email: config.fromEmail,
      },
    }),
  });

  if (!response.ok) {
    const message = await readBrevoError(response);
    throw new Error(`Brevo email failed: ${response.status} ${message}`);
  }
}

export async function sendVerificationCode(email: string, code: string) {
  console.log("Verification email Brevo send started");
  await sendBrevoEmail({
    to: [
      {
        email,
      },
    ],
    subject: "NutriTrack verification code",
    textContent: `Your NutriTrack verification code is: ${code}\nThis code expires in 10 minutes.`,
    htmlContent: `<p>Your NutriTrack verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
  console.log("Verification email Brevo send completed");
}

export async function sendEmailChangeCode(email: string, code: string) {
  console.log("Email change verification Brevo send started");
  await sendBrevoEmail({
    to: [{ email }],
    subject: "Confirm your NutriTrack email change",
    textContent: `Your NutriTrack email change code is: ${code}\nThis code expires in 10 minutes.`,
    htmlContent: `<p>Your NutriTrack email change code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
  console.log("Email change verification Brevo send completed");
}

export async function sendPasswordResetCode(email: string, code: string) {
  console.log("Password reset email Brevo send started");
  await sendBrevoEmail({
    to: [
      {
        email,
      },
    ],
    subject: "NutriTrack password reset code",
    textContent: `Your NutriTrack password reset code is: ${code}\nThis code expires in 10 minutes.`,
    htmlContent: `<p>Your NutriTrack password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
  console.log("Password reset email Brevo send completed");
}
