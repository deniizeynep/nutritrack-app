import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

const goalSchema = z.object({
  age: z.number().int().positive(),
  heightCm: z.number().int().positive(),
  weightKg: z.number().int().positive(),
  gender: z.enum(["female", "male"]),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "veryActive",
  ]),
  goalType: z.enum(["lose", "maintain", "gain"]),
  bmr: z.number().int().positive(),
  maintenanceCalories: z.number().int().positive(),
  targetCalories: z.number().int().positive(),
});

function getUserId(req: AuthRequest) {
  if (!req.userId) {
    throw new Error("User id not found");
  }

  return req.userId;
}

function formatGoal(goal: {
  id: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: string;
  activityLevel: string;
  goalType: string;
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: goal.id,
    age: goal.age,
    heightCm: goal.heightCm,
    weightKg: goal.weightKg,
    gender: goal.gender,
    activityLevel: goal.activityLevel,
    goalType: goal.goalType,
    bmr: goal.bmr,
    maintenanceCalories: goal.maintenanceCalories,
    targetCalories: goal.targetCalories,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);

    const goal = await prisma.goal.findUnique({
      where: {
        userId,
      },
    });

    res.json({
      goal: goal ? formatGoal(goal) : null,
    });
  } catch (error) {
    console.error("GET GOAL ERROR:", error);

    res.status(500).json({
      message: "Hedef bilgisi alınamadı.",
    });
  }
});

router.put("/", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);

    const parsed = goalSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Hedef bilgileri geçersiz.",
      });
      return;
    }

    const goal = await prisma.goal.upsert({
      where: {
        userId,
      },
      update: {
        age: parsed.data.age,
        heightCm: parsed.data.heightCm,
        weightKg: parsed.data.weightKg,
        gender: parsed.data.gender,
        activityLevel: parsed.data.activityLevel,
        goalType: parsed.data.goalType,
        bmr: parsed.data.bmr,
        maintenanceCalories: parsed.data.maintenanceCalories,
        targetCalories: parsed.data.targetCalories,
      },
      create: {
        age: parsed.data.age,
        heightCm: parsed.data.heightCm,
        weightKg: parsed.data.weightKg,
        gender: parsed.data.gender,
        activityLevel: parsed.data.activityLevel,
        goalType: parsed.data.goalType,
        bmr: parsed.data.bmr,
        maintenanceCalories: parsed.data.maintenanceCalories,
        targetCalories: parsed.data.targetCalories,
        userId,
      },
    });

    res.json({
      goal: formatGoal(goal),
    });
  } catch (error) {
    console.error("UPSERT GOAL ERROR:", error);

    res.status(500).json({
      message: "Hedef kaydedilemedi.",
    });
  }
});

router.delete("/", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);

    const existingGoal = await prisma.goal.findUnique({
      where: {
        userId,
      },
    });

    if (!existingGoal) {
      res.status(404).json({
        message: "Hedef bulunamadı.",
      });
      return;
    }

    await prisma.goal.delete({
      where: {
        userId,
      },
    });

    res.json({
      message: "Hedef silindi.",
    });
  } catch (error) {
    console.error("DELETE GOAL ERROR:", error);

    res.status(500).json({
      message: "Hedef silinemedi.",
    });
  }
});

export default router;
