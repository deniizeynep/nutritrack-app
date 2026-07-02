import { Router } from "express";

const router = Router();

type OpenFoodFactsResponse = {
  code?: string;
  status: number;
  product?: {
    product_name?: string;
    product_name_tr?: string;
    generic_name?: string;
    brands?: string;
    nutriments?: {
      "energy-kcal_100g"?: number;
      "energy-kcal"?: number;
      energy_100g?: number;
      proteins_100g?: number;
      proteins?: number;
      carbohydrates_100g?: number;
      carbohydrates?: number;
      fat_100g?: number;
      fat?: number;
    };
  };
};

function safeRound(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.round(numberValue);
}

router.get("/:barcode", async (req, res) => {
  const barcode = req.params.barcode.trim();

  if (!/^\d{8,14}$/.test(barcode)) {
    res.status(400).json({
      message: "Barkod geçersiz.",
    });
    return;
  }

  if (
    barcode.startsWith("978") ||
    barcode.startsWith("979") ||
    barcode.startsWith("977")
  ) {
    res.status(422).json({
      message: "Bu barkod desteklenmiyor.",
    });
    return;
  }

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=code,status,product_name,product_name_tr,generic_name,brands,nutriments`,
    );

    if (!response.ok) {
      throw new Error("Open Food Facts request failed");
    }

    const data = (await response.json()) as OpenFoodFactsResponse;

    if (data.status !== 1 || !data.product) {
      res.status(404).json({
        message: "Ürün bulunamadı.",
      });
      return;
    }

    const product = data.product;
    const nutriments = product.nutriments;

    res.json({
      code: data.code || barcode,
      productName:
        product.product_name_tr ||
        product.product_name ||
        product.generic_name ||
        "Unknown product",
      brand: product.brands || "",
      calories: safeRound(
        nutriments?.["energy-kcal_100g"] ??
          nutriments?.["energy-kcal"] ??
          nutriments?.energy_100g,
      ),
      protein: safeRound(nutriments?.proteins_100g ?? nutriments?.proteins),
      carbs: safeRound(
        nutriments?.carbohydrates_100g ?? nutriments?.carbohydrates,
      ),
      fat: safeRound(nutriments?.fat_100g ?? nutriments?.fat),
    });
  } catch (error) {
    console.error("BARCODE LOOKUP ERROR:", error);

    res.status(500).json({
      message: "Ürün bilgisi alınamadı.",
    });
  }
});

export default router;
