import bcrypt from "bcryptjs";
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware";
import { authRateLimiter } from "../middleware/rateLimit";
import { sendVerificationCode } from "../services/email.service";
import { createToken } from "../utils/token";

const router = Router();

const gmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .refine((email) => email.endsWith("@gmail.com"));

const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Za-z]/)
  .regex(/[0-9]/);

const registerSchema = z.object({
  fullName: z.string().trim().min(2),
  email: gmailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: gmailSchema,
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  email: gmailSchema,
  code: z.string().regex(/^\d{6}$/),
});

const resendVerificationSchema = z.object({
  email: gmailSchema,
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

type GoogleTokenPayload = {
  email?: string;
  sub?: string;
  email_verified?: boolean;
  name?: string | null;
  picture?: string | null;
};

const googleWebClientId = process.env.GOOGLE_WEB_CLIENT_ID;
const googleOAuthClient = googleWebClientId
  ? new OAuth2Client(googleWebClientId)
  : null;

function formatUser(user: {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    emailVerified: user.emailVerified,
  };
}

function getGoogleDisplayName(email: string, name?: string | null) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return email.split("@")[0] || email;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOtpExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

async function createOtpHash(code: string) {
  return bcrypt.hash(code, 10);
}

async function issueAndSendOtp(userId: string, email: string) {
  const code = generateOtp();
  const emailOtpHash = await createOtpHash(code);
  const now = new Date();

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      emailOtpHash,
      emailOtpExpiresAt: getOtpExpiry(),
      emailOtpLastSentAt: now,
    },
  });

  await sendVerificationCode({
    to: email,
    code,
  });
}

function verificationRequiredResponse(email: string, message: string) {
  return {
    requiresEmailVerification: true,
    email,
    message,
  };
}

router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Lütfen geçerli bir Gmail adresi ve güçlü şifre girin.",
      });
      return;
    }

    const { fullName, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(409).json({
        message: "Bu e-posta zaten kayıtlı.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        authProvider: "email",
        emailVerified: false,
      },
    });

    await issueAndSendOtp(user.id, email);

    res.status(201).json(
      verificationRequiredResponse(email, "Verification code sent."),
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Kayıt oluşturulamadı.",
    });
  }
});

router.post("/verify-email", authRateLimiter, async (req, res) => {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Kod hatalı veya süresi dolmuş.",
      });
      return;
    }

    const { email, code } = parsed.data;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.emailOtpHash || !user.emailOtpExpiresAt) {
      res.status(400).json({
        message: "Kod hatalı veya süresi dolmuş.",
      });
      return;
    }

    if (user.emailOtpExpiresAt.getTime() < Date.now()) {
      res.status(400).json({
        message: "Kodun süresi doldu. Lütfen yeni kod isteyin.",
      });
      return;
    }

    const isCodeValid = await bcrypt.compare(code, user.emailOtpHash);

    if (!isCodeValid) {
      res.status(400).json({
        message: "Kod hatalı veya süresi dolmuş.",
      });
      return;
    }

    const verifiedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
        emailOtpHash: null,
        emailOtpExpiresAt: null,
        emailOtpLastSentAt: null,
      },
    });

    const token = createToken(verifiedUser.id);

    res.json({
      token,
      user: formatUser(verifiedUser),
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);

    res.status(500).json({
      message: "Email doğrulanamadı.",
    });
  }
});

router.post("/resend-verification", authRateLimiter, async (req, res) => {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Lütfen geçerli bir Gmail adresi girin.",
      });
      return;
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "Kullanıcı bulunamadı.",
      });
      return;
    }

    if (user.emailVerified) {
      res.json({
        message: "Email zaten doğrulanmış.",
      });
      return;
    }

    if (
      user.emailOtpLastSentAt &&
      Date.now() - user.emailOtpLastSentAt.getTime() < 60 * 1000
    ) {
      res.status(429).json({
        message: "Yeni kod istemeden önce biraz bekleyin.",
      });
      return;
    }

    await issueAndSendOtp(user.id, email);

    res.json({
      message: "Verification code sent.",
    });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:", error);

    res.status(500).json({
      message: "Kod yeniden gönderilemedi.",
    });
  }
});

router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Lütfen geçerli Gmail adresi ve şifre girin.",
      });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "E-posta veya şifre hatalı.",
      });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({
        message: "Bu hesap Google ile oluşturulmuş. Lütfen Google ile giriş yap.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "E-posta veya şifre hatalı.",
      });
      return;
    }

    if (!user.emailVerified) {
      res.json(verificationRequiredResponse(email, "Please verify your email."));
      return;
    }

    const token = createToken(user.id);

    res.json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Giriş yapılamadı.",
    });
  }
});

router.post("/google", authRateLimiter, async (req, res) => {
  try {
    const parsed = googleAuthSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Google giriş bilgileri geçersiz.",
      });
      return;
    }

    if (!googleOAuthClient || !googleWebClientId) {
      console.error("GOOGLE_WEB_CLIENT_ID is missing");

      res.status(500).json({
        message: "Google ile giriş yapılandırılmamış.",
      });
      return;
    }

    let payload: GoogleTokenPayload | null = null;

    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: parsed.data.idToken,
        audience: googleWebClientId,
      });

      const rawPayload = ticket.getPayload();
      payload = rawPayload ? (rawPayload as GoogleTokenPayload) : null;
    } catch (error) {
      console.error("GOOGLE TOKEN VERIFY ERROR:", error);

      res.status(401).json({
        message: "Google hesabı doğrulanamadı.",
      });
      return;
    }

    if (!payload?.email || !payload.sub || payload.email_verified !== true) {
      res.status(401).json({
        message: "Google hesabı doğrulanamadı.",
      });
      return;
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();

    if (!email.endsWith("@gmail.com")) {
      res.status(400).json({
        message: "Sadece Gmail adresleri kabul edilir.",
      });
      return;
    }

    const fullName = getGoogleDisplayName(email, payload.name);
    const avatarUrl = payload.picture?.trim() || null;

    const existingByGoogleId = await prisma.user.findUnique({
      where: {
        googleId,
      },
    });

    if (existingByGoogleId) {
      const verifiedUser = existingByGoogleId.emailVerified
        ? existingByGoogleId
        : await prisma.user.update({
            where: {
              id: existingByGoogleId.id,
            },
            data: {
              emailVerified: true,
              emailOtpHash: null,
              emailOtpExpiresAt: null,
              emailOtpLastSentAt: null,
            },
          });
      const token = createToken(verifiedUser.id);

      res.json({
        token,
        user: formatUser(verifiedUser),
      });
      return;
    }

    const existingByEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingByEmail) {
      const linkedUser = await prisma.user.update({
        where: {
          email,
        },
        data: {
          googleId,
          avatarUrl: avatarUrl ?? existingByEmail.avatarUrl ?? null,
          authProvider: existingByEmail.passwordHash ? "email_google" : "google",
          fullName: existingByEmail.fullName.trim() || fullName,
          emailVerified: true,
          emailOtpHash: null,
          emailOtpExpiresAt: null,
          emailOtpLastSentAt: null,
        },
      });

      const token = createToken(linkedUser.id);

      res.json({
        token,
        user: formatUser(linkedUser),
      });
      return;
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        googleId,
        avatarUrl,
        authProvider: "google",
        emailVerified: true,
      },
    });

    const token = createToken(user.id);

    res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    res.status(500).json({
      message: "Google ile giriş yapılamadı.",
    });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = (req as AuthRequest).userId;

    if (!userId) {
      res.status(401).json({
        message: "Kullanıcı doğrulanamadı.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "Kullanıcı bulunamadı.",
      });
      return;
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    res.status(500).json({
      message: "Kullanıcı bilgileri alınamadı.",
    });
  }
});

router.delete("/me", authMiddleware, async (req, res) => {
  try {
    const userId = (req as AuthRequest).userId;

    if (!userId) {
      res.status(401).json({
        message: "Kullanıcı doğrulanamadı.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(404).json({
        message: "Kullanıcı bulunamadı.",
      });
      return;
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.json({
      message: "Hesap silindi.",
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);

    res.status(500).json({
      message: "Hesap silinemedi.",
    });
  }
});

export default router;
