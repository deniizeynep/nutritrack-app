import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

const mealSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  category: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().int().nonnegative(),
  protein: z.number().int().nonnegative().optional().default(0),
  carbs: z.number().int().nonnegative().optional().default(0),
  fat: z.number().int().nonnegative().optional().default(0),
  loggedAt: z.string().datetime().optional(),
});

const updateMealSchema = mealSchema.partial();

function getUserId(req: AuthRequest) {
  if (!req.userId) {
    throw new Error("User id not found");
  }

  return req.userId;
}

function formatMeal(meal: {
  id: string;
  title: string;
  description: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: meal.id,
    title: meal.title,
    description: meal.description,
    category: meal.category,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    loggedAt: meal.loggedAt.toISOString(),
    createdAt: meal.createdAt.toISOString(),
    updatedAt: meal.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);

    const meals = await prisma.meal.findMany({
      where: {
        userId,
      },
      orderBy: {
        loggedAt: "desc",
      },
    });

    res.json(meals.map(formatMeal));
  } catch (error) {
    console.error("GET MEALS ERROR:", error);

    res.status(500).json({
      message: "Öğünler alınamadı.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);

    const parsed = mealSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Öğün bilgileri geçersiz.",
      });
      return;
    }

    const meal = await prisma.meal.create({
      data: {
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || "",
        category: parsed.data.category,
        calories: parsed.data.calories,
        protein: parsed.data.protein,
        carbs: parsed.data.carbs,
        fat: parsed.data.fat,
        loggedAt: parsed.data.loggedAt
          ? new Date(parsed.data.loggedAt)
          : new Date(),
        userId,
      },
    });

    res.status(201).json(formatMeal(meal));
  } catch (error) {
    console.error("CREATE MEAL ERROR:", error);

    res.status(500).json({
      message: "Öğün oluşturulamadı.",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);
    const mealId = req.params.id;

    const parsed = updateMealSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Güncellenecek öğün bilgileri geçersiz.",
      });
      return;
    }

    const existingMeal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId,
      },
    });

    if (!existingMeal) {
      res.status(404).json({
        message: "Öğün bulunamadı.",
      });
      return;
    }

    const updatedMeal = await prisma.meal.update({
      where: {
        id: mealId,
      },
      data: {
        ...(parsed.data.title !== undefined
          ? { title: parsed.data.title.trim() }
          : {}),
        ...(parsed.data.description !== undefined
          ? { description: parsed.data.description.trim() }
          : {}),
        ...(parsed.data.category !== undefined
          ? { category: parsed.data.category }
          : {}),
        ...(parsed.data.calories !== undefined
          ? { calories: parsed.data.calories }
          : {}),
        ...(parsed.data.protein !== undefined
          ? { protein: parsed.data.protein }
          : {}),
        ...(parsed.data.carbs !== undefined
          ? { carbs: parsed.data.carbs }
          : {}),
        ...(parsed.data.fat !== undefined ? { fat: parsed.data.fat } : {}),
        ...(parsed.data.loggedAt !== undefined
          ? { loggedAt: new Date(parsed.data.loggedAt) }
          : {}),
      },
    });

    res.json(formatMeal(updatedMeal));
  } catch (error) {
    console.error("UPDATE MEAL ERROR:", error);

    res.status(500).json({
      message: "Öğün güncellenemedi.",
    });
  }
});

router.delete("/", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);

    await prisma.meal.deleteMany({
      where: {
        userId,
      },
    });

    res.json({
      message: "Tüm öğünler silindi.",
    });
  } catch (error) {
    console.error("CLEAR MEALS ERROR:", error);

    res.status(500).json({
      message: "Öğünler temizlenemedi.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req as AuthRequest);
    const mealId = req.params.id;

    const existingMeal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId,
      },
    });

    if (!existingMeal) {
      res.status(404).json({
        message: "Öğün bulunamadı.",
      });
      return;
    }

    await prisma.meal.delete({
      where: {
        id: mealId,
      },
    });

    res.json({
      message: "Öğün silindi.",
    });
  } catch (error) {
    console.error("DELETE MEAL ERROR:", error);

    res.status(500).json({
      message: "Öğün silinemedi.",
    });
  }
});

export default router;
