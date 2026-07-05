import nodemailer from "nodemailer";

type SendVerificationCodeParams = {
  to: string;
  code: string;
};

type SendPasswordResetCodeParams = {
  to: string;
  code: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP configuration is missing");
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

export async function sendVerificationCode({
  to,
  code,
}: SendVerificationCodeParams) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "NutriTrack verification code",
    text: `Your NutriTrack verification code is: ${code}\nThis code expires in 10 minutes.`,
  });
}

export async function sendPasswordResetCode({
  to,
  code,
}: SendPasswordResetCodeParams) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "NutriTrack password reset code",
    text: `Your NutriTrack password reset code is: ${code}\nThis code expires in 10 minutes.`,
  });
}
