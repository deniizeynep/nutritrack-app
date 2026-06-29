export type OpenFoodProduct = {
  barcode: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type OpenFoodFactsResponse = {
  code?: string;
  status: number;
  status_verbose?: string;
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

export async function getProductByBarcode(
  barcode: string,
): Promise<OpenFoodProduct | null> {
  const cleanedBarcode = barcode.trim();

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${cleanedBarcode}.json?fields=code,status,status_verbose,product_name,product_name_tr,generic_name,brands,nutriments`,
  );

  if (!response.ok) {
    throw new Error("Product request failed");
  }

  const data = (await response.json()) as OpenFoodFactsResponse;

  console.log("OPEN FOOD FACTS STATUS:", data.status, data.status_verbose);
  console.log("OPEN FOOD FACTS CODE:", data.code);

  if (data.status !== 1 || !data.product) {
    return null;
  }

  const product = data.product;
  const nutriments = product.nutriments;

  return {
    barcode: cleanedBarcode,
    name:
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
  };
}
