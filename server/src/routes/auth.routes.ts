import bcrypt from "bcryptjs";
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware";
import { authRateLimiter } from "../middleware/rateLimit";
import { createToken } from "../utils/token";

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

function formatUser(user: { id: string; fullName: string; email: string }) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

function getGoogleDisplayName(email: string, name?: string | null) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return email.split("@")[0] || email;
}

router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Lütfen bilgileri doğru doldurun.",
      });
      return;
    }

    const { fullName, password } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();

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
        fullName: fullName.trim(),
        email,
        passwordHash,
      },
    });

    const token = createToken(user.id);

    res.status(201).json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Kayıt oluşturulamadı.",
    });
  }
});

router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Lütfen e-posta ve şifre girin.",
      });
      return;
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;

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

    let payload:
      | GoogleTokenPayload
      | null = null;

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
    const fullName = getGoogleDisplayName(email, payload.name);
    const avatarUrl = payload.picture?.trim() || null;

    const existingByGoogleId = await prisma.user.findUnique({
      where: {
        googleId,
      },
    });

    if (existingByGoogleId) {
      const token = createToken(existingByGoogleId.id);

      res.json({
        token,
        user: formatUser(existingByGoogleId),
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
