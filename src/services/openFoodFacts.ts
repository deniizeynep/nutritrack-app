import { apiRequest } from "./apiClient";

export type OpenFoodProduct = {
  barcode: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type BarcodeProductResponse = {
  code: string;
  productName: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export async function getProductByBarcode(
  barcode: string,
): Promise<OpenFoodProduct | null> {
  const cleanedBarcode = barcode.trim();

  try {
    const product = await apiRequest<BarcodeProductResponse>(
      `/barcode/${cleanedBarcode}`,
    );

    return {
      barcode: product.code,
      name: product.productName,
      brand: product.brand || "",
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Ürün bulunamadı.") {
      return null;
    }

    throw error;
  }
}
