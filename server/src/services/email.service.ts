import { Resend } from "resend";

type SendVerificationCodeParams = {
  to: string;
  code: string;
};

type SendPasswordResetCodeParams = {
  to: string;
  code: string;
};

const defaultEmailFrom = "NutriTrack <onboarding@resend.dev>";

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || defaultEmailFrom;

  if (!apiKey) {
    throw new Error("Email configuration is missing: RESEND_API_KEY");
  }

  return {
    apiKey,
    from,
  };
}

function createResendClient() {
  const config = getEmailConfig();

  return {
    config,
    resend: new Resend(config.apiKey),
  };
}

async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const { config, resend } = createResendClient();
  const result = await resend.emails.send({
    from: config.from,
    to,
    subject,
    text,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message || "Email delivery failed");
  }
}

export async function sendVerificationCode({
  to,
  code,
}: SendVerificationCodeParams) {
  console.log("Verification email API send started");
  await sendEmail({
    to,
    subject: "NutriTrack verification code",
    text: `Your NutriTrack verification code is: ${code}\nThis code expires in 10 minutes.`,
    html: `<p>Your NutriTrack verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
  console.log("Verification email API send completed");
}

export async function sendPasswordResetCode({
  to,
  code,
}: SendPasswordResetCodeParams) {
  console.log("Password reset email API send started");
  await sendEmail({
    to,
    subject: "NutriTrack password reset code",
    text: `Your NutriTrack password reset code is: ${code}\nThis code expires in 10 minutes.`,
    html: `<p>Your NutriTrack password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
  console.log("Password reset email API send completed");
}
