import { prisma } from "../lib/prisma";

export type AIGatewayFeature = "food_photo_analysis";
export type AIGatewayInputType = "image" | "text" | "audio" | "video";
export type AIGatewayStatus = "success" | "failed";

type AIGatewayMetadata = {
  userId?: string;
  appName?: string;
  feature: AIGatewayFeature;
  provider: string;
  model?: string;
  inputType: AIGatewayInputType;
};

type AIGatewayErrorDetails = {
  errorCode: string;
  errorMessage: string;
};

type AIGatewayExecuteOptions<T> = AIGatewayMetadata & {
  execute: () => Promise<T>;
};

export async function runAIGatewayCall<T>(
  options: AIGatewayExecuteOptions<T>,
): Promise<T> {
  const startedAt = Date.now();

  try {
    const result = await options.execute();

    await logAIUsage({
      ...options,
      status: "success",
      durationMs: Date.now() - startedAt,
    });

    return result;
  } catch (error) {
    const errorDetails = getSafeAIGatewayErrorDetails(error);

    await logAIUsage({
      ...options,
      status: "failed",
      durationMs: Date.now() - startedAt,
      ...errorDetails,
    });

    throw error;
  }
}

export async function getUserAIUsage(userId: string) {
  const [items, total, success, failed] = await Promise.all([
    prisma.aiUsage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        appName: true,
        feature: true,
        provider: true,
        model: true,
        inputType: true,
        status: true,
        durationMs: true,
        errorCode: true,
        errorMessage: true,
        createdAt: true,
      },
    }),
    prisma.aiUsage.count({ where: { userId } }),
    prisma.aiUsage.count({ where: { userId, status: "success" } }),
    prisma.aiUsage.count({ where: { userId, status: "failed" } }),
  ]);

  return {
    items,
    summary: {
      total,
      success,
      failed,
    },
  };
}

async function logAIUsage(
  input: AIGatewayMetadata & {
    status: AIGatewayStatus;
    durationMs: number;
    errorCode?: string;
    errorMessage?: string;
  },
) {
  try {
    await prisma.aiUsage.create({
      data: {
        userId: input.userId,
        appName: input.appName || "nutritrack",
        feature: input.feature,
        provider: input.provider,
        model: input.model,
        inputType: input.inputType,
        status: input.status,
        durationMs: input.durationMs,
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
      },
    });
  } catch (error) {
    console.error("AI USAGE LOGGING ERROR:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      feature: input.feature,
      provider: input.provider,
      model: input.model,
      status: input.status,
    });
  }
}

function getSafeAIGatewayErrorDetails(error: unknown): AIGatewayErrorDetails {
  if (error instanceof Error) {
    return {
      errorCode: error.name || "AI_ERROR",
      errorMessage: error.message,
    };
  }

  return {
    errorCode: "AI_ERROR",
    errorMessage: String(error),
  };
}
