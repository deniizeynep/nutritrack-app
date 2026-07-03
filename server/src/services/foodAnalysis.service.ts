import { GoogleGenAI, Type, type Schema } from "@google/genai";
import OpenAI from "openai";
import { z } from "zod";

export type FoodAnalysisResult = {
  foodName: {
    tr: string;
    en: string;
  };
  portion?: {
    tr: string;
    en: string;
  };
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  source: "mock" | "ai";
};

export type FoodAnalysisProviderConfig = {
  provider: string;
  model?: string;
};

export class AIConfigurationError extends Error {
  constructor() {
    super("AI service is not configured");
    this.name = "AIConfigurationError";
  }
}

export class AIParseError extends Error {
  constructor() {
    super("AI result could not be parsed");
    this.name = "AIParseError";
  }
}

export class AIOpenAIError extends Error {
  constructor() {
    super("OpenAI food analysis failed");
    this.name = "AIOpenAIError";
  }
}

export class AIGeminiError extends Error {
  constructor() {
    super("Gemini food analysis failed");
    this.name = "AIGeminiError";
  }
}

type ProviderErrorDetails = {
  name?: string;
  message?: string;
  status?: unknown;
  code?: unknown;
  type?: unknown;
  body?: unknown;
};

const foodAnalysisSchema = z.object({
  foodName: z.object({
    tr: z.string().min(1),
    en: z.string().min(1),
  }),
  portion: z.object({
    tr: z.string().min(1),
    en: z.string().min(1),
  }),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  confidence: z.number().min(0).max(100),
});

const mockFoodAnalysis: FoodAnalysisResult = {
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
};

const foodAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    foodName: {
      type: "object",
      additionalProperties: false,
      properties: {
        tr: { type: "string" },
        en: { type: "string" },
      },
      required: ["tr", "en"],
    },
    portion: {
      type: "object",
      additionalProperties: false,
      properties: {
        tr: { type: "string" },
        en: { type: "string" },
      },
      required: ["tr", "en"],
    },
    calories: { type: "number" },
    protein: { type: "number" },
    carbs: { type: "number" },
    fat: { type: "number" },
    confidence: { type: "number", minimum: 0, maximum: 100 },
  },
  required: [
    "foodName",
    "portion",
    "calories",
    "protein",
    "carbs",
    "fat",
    "confidence",
  ],
};

const geminiFoodAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodName: {
      type: Type.OBJECT,
      properties: {
        tr: { type: Type.STRING },
        en: { type: Type.STRING },
      },
      required: ["tr", "en"],
    },
    portion: {
      type: Type.OBJECT,
      properties: {
        tr: { type: Type.STRING },
        en: { type: Type.STRING },
      },
      required: ["tr", "en"],
    },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fat: { type: Type.NUMBER },
    confidence: { type: Type.NUMBER, minimum: 0, maximum: 100 },
  },
  required: [
    "foodName",
    "portion",
    "calories",
    "protein",
    "carbs",
    "fat",
    "confidence",
  ],
};

function getProviderErrorDetails(error: unknown): ProviderErrorDetails {
  const errorRecord = error as {
    status?: unknown;
    code?: unknown;
    type?: unknown;
    error?: unknown;
    body?: unknown;
    response?: {
      data?: unknown;
      body?: unknown;
    };
  };

  return {
    name: error instanceof Error ? error.name : undefined,
    message: error instanceof Error ? error.message : String(error),
    status: errorRecord.status,
    code: errorRecord.code,
    type: errorRecord.type,
    body:
      errorRecord.error ??
      errorRecord.body ??
      errorRecord.response?.data ??
      errorRecord.response?.body,
  };
}

function parseFoodAnalysisResult(
  rawOutput: string | undefined,
  configDetails: Record<string, unknown>,
): FoodAnalysisResult {
  try {
    if (!rawOutput) {
      console.error("AI RAW OUTPUT EMPTY:", { config: configDetails });
      throw new AIParseError();
    }

    const parsedJson = JSON.parse(rawOutput);
    const parsedResult = foodAnalysisSchema.safeParse(parsedJson);

    if (!parsedResult.success) {
      console.error("AI VALIDATION ERROR:", {
        issues: parsedResult.error.issues,
        config: configDetails,
      });
      console.error("AI RAW OUTPUT:", rawOutput);
      throw new AIParseError();
    }

    const parsed = parsedResult.data;

    return {
      ...parsed,
      calories: Math.round(parsed.calories),
      protein: Math.round(parsed.protein),
      carbs: Math.round(parsed.carbs),
      fat: Math.round(parsed.fat),
      confidence: Math.round(parsed.confidence),
      source: "ai",
    };
  } catch (error) {
    if (error instanceof AIParseError) {
      throw error;
    }

    console.error("AI JSON PARSE ERROR:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      config: configDetails,
    });
    console.error("AI RAW OUTPUT:", rawOutput);
    throw new AIParseError();
  }
}

export async function analyzeFoodPhoto(input: {
  buffer: Buffer;
  mimeType: string;
}): Promise<FoodAnalysisResult> {
  const provider = process.env.AI_PROVIDER || "mock";

  if (provider !== "openai") {
    if (provider === "gemini") {
      return analyzeFoodPhotoWithGemini(input, provider);
    }

    return mockFoodAnalysis;
  }

  return analyzeFoodPhotoWithOpenAI(input, provider);
}

export function getFoodAnalysisProviderConfig(): FoodAnalysisProviderConfig {
  const provider = process.env.AI_PROVIDER || "mock";

  if (provider === "openai") {
    return {
      provider,
      model: process.env.OPENAI_FOOD_MODEL || "gpt-4o-mini",
    };
  }

  if (provider === "gemini") {
    return {
      provider,
      model: process.env.GEMINI_FOOD_MODEL || "gemini-2.5-flash",
    };
  }

  return {
    provider: "mock",
    model: "mock",
  };
}

async function analyzeFoodPhotoWithOpenAI(
  input: {
    buffer: Buffer;
    mimeType: string;
  },
  provider: string,
): Promise<FoodAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_FOOD_MODEL || "gpt-4o-mini";
  const configDetails = {
    aiProvider: provider,
    openAiFoodModel: model,
    hasOpenAiKey: Boolean(apiKey),
  };

  if (!apiKey) {
    console.error("OPENAI FOOD ANALYSIS CONFIG ERROR:", configDetails);
    throw new AIConfigurationError();
  }

  const openai = new OpenAI({ apiKey });
  const base64Image = input.buffer.toString("base64");
  const imageUrl = `data:${input.mimeType};base64,${base64Image}`;

  let response;

  try {
    response = await openai.responses.create({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Analyze this food photo for a calorie tracking app. Return only the requested JSON fields. Estimate calories and macros for the visible portion. If the food is unclear, return your best estimate with lower confidence. Do not claim medical certainty; this is only a nutrition estimate that the user can edit.",
            },
            {
              type: "input_image",
              image_url: imageUrl,
              detail: "auto",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "food_analysis",
          strict: true,
          schema: foodAnalysisJsonSchema,
        },
      },
    });
  } catch (error) {
    console.error("OPENAI FOOD ANALYSIS ERROR:", {
      ...getProviderErrorDetails(error),
      config: configDetails,
    });
    throw new AIOpenAIError();
  }

  return parseFoodAnalysisResult(response.output_text, configDetails);
}

async function analyzeFoodPhotoWithGemini(
  input: {
    buffer: Buffer;
    mimeType: string;
  },
  provider: string,
): Promise<FoodAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_FOOD_MODEL || "gemini-2.5-flash";
  const configDetails = {
    aiProvider: provider,
    geminiFoodModel: model,
    hasGeminiKey: Boolean(apiKey),
  };

  if (!apiKey) {
    console.error("GEMINI FOOD ANALYSIS CONFIG ERROR:", configDetails);
    throw new AIConfigurationError();
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Image = input.buffer.toString("base64");

  let response;

  try {
    response = await ai.models.generateContent({
      model,
      contents: [
        {
          text:
            "Analyze this food photo for a calorie tracking app. Return only JSON that matches the response schema. Estimate calories and macros for the visible portion. If the food is unclear, return your best estimate with lower confidence. Do not claim medical certainty; this is only a nutrition estimate that the user can edit.",
        },
        {
          inlineData: {
            data: base64Image,
            mimeType: input.mimeType,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiFoodAnalysisSchema,
      },
    });
  } catch (error) {
    console.error("GEMINI FOOD ANALYSIS ERROR:", {
      ...getProviderErrorDetails(error),
      config: configDetails,
    });
    throw new AIGeminiError();
  }

  return parseFoodAnalysisResult(response.text, configDetails);
}
