// utils/brand.cache.ts
import NodeCache from "node-cache";
import { BrandModel, BrandDocument } from "../models/brand.model";
import { LeanDocument } from "mongoose";

const BRAND_CACHE_KEY = "allBrands";

// TTL in seconds (optional, long TTL since we invalidate manually)
const TTL = 12 * 60 * 60; // 12 hours
const CHECK_PERIOD = 600; // 10 minutes

const cache = new NodeCache({ stdTTL: TTL, checkperiod: CHECK_PERIOD });

// Use LeanDocument typing because we store plain objects in cache
type CachedBrand = LeanDocument<BrandDocument>;

// -------------------- Functions --------------------

// Fetch brands from cache or DB
const getCachedBrands = async (): Promise<CachedBrand[]> => {
  try {
    const cached = cache.get<CachedBrand[]>(BRAND_CACHE_KEY);
    if (cached) return cached;

    const brands = await BrandModel.find({ isActive: true }).lean();
    cache.set(BRAND_CACHE_KEY, brands);
    return brands;
  } catch (error) {
    console.error("Error fetching cached brands:", error);
    // Fallback: query DB directly
    return BrandModel.find({ isActive: true }).lean();
  }
};

// Force refresh cache from DB
const refreshBrandCache = async (): Promise<CachedBrand[]> => {
  try {
    const brands = await BrandModel.find({ isActive: true }).lean();
    cache.set(BRAND_CACHE_KEY, brands);
    return brands;
  } catch (error) {
    console.error("Error refreshing brand cache:", error);
    return [];
  }
};

// Invalidate cache manually
const invalidateBrandCache = (): void => {
  try {
    cache.del(BRAND_CACHE_KEY);
  } catch (error) {
    console.error("Error invalidating brand cache:", error);
  }
};

// -------------------- Exports --------------------
export {
  getCachedBrands,
  refreshBrandCache,
  invalidateBrandCache,
};

export type { CachedBrand };
