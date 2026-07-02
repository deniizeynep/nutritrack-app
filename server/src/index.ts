import cors from "cors";
import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth.routes";
import goalRoutes from "./routes/goal.routes";
import mealRoutes from "./routes/meal.routes";

const app = express();

const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/goal", goalRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "NutriTrack API is running",
      database: "connected",
    });
  } catch {
    res.status(500).json({
      status: "error",
      message: "API is running but database connection failed",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`NutriTrack API running on port ${port}`);
});
