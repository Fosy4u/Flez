// types/product.variant.types.ts

export type VariantAttributes = Record<string, string>;

export interface VariantCombo {
  attributes: VariantAttributes;
}

export interface SaveVariantPayload {
  attributes: VariantAttributes;
  price: number;
  stock: number;
}