import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const rawPort = process.env.SMTP_PORT || "587";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const missingKeys = [
    ["SMTP_HOST", host],
    ["SMTP_PORT", rawPort],
    ["SMTP_USER", user],
    ["SMTP_PASS", pass],
    ["SMTP_FROM", from],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`SMTP configuration is missing: ${missingKeys.join(", ")}`);
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP configuration is invalid: SMTP_PORT");
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: port === 465,
  };
}

function createSmtpTransporter() {
  const config = getSmtpConfig();

  return {
    config,
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    }),
  };
}

export async function sendVerificationCode(email: string, code: string) {
  const { config, transporter } = createSmtpTransporter();

  console.log("Verification email sendMail started");
  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "NutriTrack verification code",
    text: `Your NutriTrack verification code is: ${code}\nThis code expires in 10 minutes.`,
    html: `<p>Your NutriTrack verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
  console.log("Verification email sendMail completed");
}

export async function sendPasswordResetCode(email: string, code: string) {
  const { config, transporter } = createSmtpTransporter();

  console.log("Password reset email sendMail started");
  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "NutriTrack password reset code",
    text: `Your NutriTrack password reset code is: ${code}\nThis code expires in 10 minutes.`,
    html: `<p>Your NutriTrack password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
  });
  console.log("Password reset email sendMail completed");
}
