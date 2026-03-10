// types/brand.types.ts
export type BrandType = "official" | "custom" | "generic";

export interface IBrand {
  name: string;
  slug: string;
  type: BrandType;
  departments: string[];
  isApproved: boolean;
  isFilterable: boolean;
  isActive: boolean;
  createdBy?: string; // userId for custom brands
  createdAt?: Date;
  updatedAt?: Date;
}
