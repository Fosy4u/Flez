// helpers/brand.helper.ts
import slugify from "slugify";
import { BrandModel } from "../models/brand.model";
import { CachedBrand, getCachedBrands, invalidateBrandCache } from "../cache/brand.cache";
import { BrandDocument } from "../models/brand.model";
// helpers/brand.helper.ts


/**
 * Map a BrandDocument / CachedBrand to frontend-friendly object
 */
const mapBrandForFrontend = (brand: CachedBrand | BrandDocument) => ({
  brand_id: brand._id,          // <-- mapped here
  name: brand.name,
  slug: brand.slug,
  type: brand.type,
  isApproved: brand.isApproved,
  isFilterable: brand.isFilterable,
  isActive: brand.isActive,
  departments: brand.departments,
});

/**
 * Create a custom brand if it does not exist.
 * Used internally by product controller.
 */
const createCustomBrand = async (
  brandName: string,
  department: string,
  vendorId: string
): Promise<ReturnType<typeof mapBrandForFrontend>> => {
  const slug = slugify(brandName, { lower: true, strict: true });

  // Check cache first
  const cachedBrands = await getCachedBrands();
  let brand = cachedBrands.find((b) => b.slug === slug);

  if (brand) return mapBrandForFrontend(brand);

  // Not found → create new custom brand
  const newBrand = await BrandModel.create({
    name: brandName,
    slug,
    type: "custom",
    departments: [department],
    isApproved: false,
    isFilterable: false,
    isActive: true,
    createdBy: vendorId,
  });

  // Invalidate cache
  invalidateBrandCache();

  return mapBrandForFrontend(newBrand);
};

/**
 * Get brand by slug (internal use)
 */
const getBrandBySlug = async (slug: string): Promise<ReturnType<typeof mapBrandForFrontend> | null> => {
  const cachedBrands = await getCachedBrands();
  const brand = cachedBrands.find((b) => b.slug === slug);
  if (brand) return mapBrandForFrontend(brand);

  // Fallback to DB
  const dbBrand = await BrandModel.findOne({ slug }).lean();
  return dbBrand ? mapBrandForFrontend(dbBrand) : null;
};

// Warm up brand cache at startup
const warmUpBrandCache = async (): Promise<void> => {
  try {
    await getCachedBrands();
    console.log("Brand cache warmed up");
  } catch (error) {
    console.error("Error warming up brand cache:", error);
  }
};
// -------------------- Exports --------------------
export { createCustomBrand, getBrandBySlug, mapBrandForFrontend, warmUpBrandCache };
export type { CachedBrand };
