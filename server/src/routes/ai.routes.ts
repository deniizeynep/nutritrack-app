import { Router } from "express";
import { z } from "zod";

const router = Router();

const analyzeFoodSchema = z.object({
  imageUri: z.string().optional(),
});

router.post("/analyze-food", (req, res) => {
  const parsed = analyzeFoodSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Fotoğraf bilgisi geçersiz.",
    });
    return;
  }

  // Real AI provider integration will be added here. Keep API keys on backend only.
  res.json({
    foodName: {
      tr: "Lahmacun",
      en: "Lahmacun",
    },
    portion: {
      tr: "1 adet",
      en: "1 piece",
    },
    calories: 430,
    protein: 18,
    carbs: 48,
    fat: 17,
    confidence: 81,
    source: "mock",
  });
});

export default router;
