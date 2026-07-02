import bcrypt from "bcryptjs";
import { Router } from "express";
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

function formatUser(user: { id: string; fullName: string; email: string }) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
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
