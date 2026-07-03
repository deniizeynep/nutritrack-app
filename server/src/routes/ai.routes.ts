import { Router } from "express";
import multer from "multer";
import { authMiddleware, type AuthRequest } from "../middleware/authMiddleware";
import { aiRateLimiter } from "../middleware/rateLimit";
import {
  getUserAIUsage,
  runAIGatewayCall,
} from "../services/aiGateway.service";
import {
  AIConfigurationError,
  AIGeminiError,
  AIOpenAIError,
  AIParseError,
  analyzeFoodPhoto,
  getFoodAnalysisProviderConfig,
} from "../services/foodAnalysis.service";

const router = Router();

router.use(authMiddleware);

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

router.get("/usage/me", async (req: AuthRequest, res) => {
  if (!req.userId) {
    res.status(401).json({
      message: "Token bulunamadı.",
    });
    return;
  }

  try {
    const usage = await getUserAIUsage(req.userId);

    res.json(usage);
  } catch (error) {
    console.error("AI USAGE FETCH ERROR:", error);

    res.status(500).json({
      message: "AI kullanım geçmişi alınamadı.",
    });
  }
});

router.post("/analyze-food", aiRateLimiter, (req, res) => {
  upload.single("photo")(req, res, async (error) => {
    const authReq = req as AuthRequest;

    if (error) {
      if (
        error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE"
      ) {
        res.status(400).json({
          message: "Fotoğraf çok büyük. Lütfen daha küçük bir fotoğraf seç.",
        });
        return;
      }

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

    const photo = req.file;
    const providerConfig = getFoodAnalysisProviderConfig();

    console.log("AI PHOTO UPLOAD DEBUG:", {
      originalname: photo.originalname,
      mimetype: photo.mimetype,
      size: photo.size,
      hasBuffer: Boolean(photo.buffer),
    });

    try {
      const result = await runAIGatewayCall({
        userId: authReq.userId,
        feature: "food_photo_analysis",
        provider: providerConfig.provider,
        model: providerConfig.model,
        inputType: "image",
        execute: () =>
          analyzeFoodPhoto({
            buffer: photo.buffer,
            mimeType: photo.mimetype,
          }),
      });

      res.json(result);
    } catch (error) {
      if (error instanceof AIConfigurationError) {
        res.status(500).json({
          message: "AI servisi yapılandırılmamış.",
        });
        return;
      }

      if (error instanceof AIParseError) {
        res.status(500).json({
          message: "AI sonucu okunamadı.",
        });
        return;
      }

      if (error instanceof AIOpenAIError || error instanceof AIGeminiError) {
        res.status(500).json({
          message: "Fotoğraf analizi yapılamadı.",
        });
        return;
      }

      console.error("AI ANALYSIS ERROR:", error);

      res.status(500).json({
        message: "Fotoğraf analizi yapılamadı.",
      });
    }
  });
});

export default router;
