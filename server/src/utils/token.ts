import jwt from "jsonwebtoken";

export type TokenPayload = {
  userId: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return secret;
}

export function createToken(userId: string) {
  return jwt.sign(
    {
      userId,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    },
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}
