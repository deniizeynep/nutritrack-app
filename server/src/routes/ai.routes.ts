import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("INVALID_PHOTO_FORMAT"));
      return;
    }

    callback(null, true);
  },
});

router.post("/analyze-food", (req, res) => {
  upload.single("photo")(req, res, (error) => {
    if (error) {
      res.status(400).json({
        message: "Geçersiz fotoğraf formatı.",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: "Fotoğraf bulunamadı.",
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
});

export default router;
