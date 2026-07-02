import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/token";

export type AuthRequest = Request & {
  userId?: string;
};

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    res.status(401).json({
      message: "Token bulunamadı.",
    });
    return;
  }

  try {
    const payload = verifyToken(token);

    req.userId = payload.userId;

    next();
  } catch {
    res.status(401).json({
      message: "Geçersiz token.",
    });
  }
}
