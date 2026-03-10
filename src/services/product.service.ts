import { deleteRedisKeysByPrefix, makeCacheKey } from "../cache/redis";
import { BUCKET_NAME, storageRef } from "../config/firebase";
import { getRandomInt } from "../helpers/utils";
import { CategoryModel } from "../models/category.model";
import {
  ProductDocument,
  ProductImage,
  ProductModel,
} from "../models/product.model";
import { VariantAttributes } from "../types/product.types";
import { getCategoryById, getCategoryProperties } from "./category.service";

const generateProductId = async (shopId: string) => {
  let productId = "";
  let found = true;
  //remove the SHOP_ prefix from shopId before generating productId
  const formattedShopId = shopId.replace(/^SHOP_/, "");
  do {
    productId = `${formattedShopId}-${getRandomInt(1000000, 9999999)}`;
    const exist = await ProductModel.findOne({ productId }, { lean: true });
    if (exist) {
      found = true;
    } else {
      found = false;
    }
  } while (found);
  return productId;
};

const generateCombinations = (
  axes: Record<string, string[]>,
): VariantAttributes[] => {
  const keys = Object.keys(axes);

  if (keys.length === 0) return [];

  let combos: VariantAttributes[] = [{}];

  for (const key of keys) {
    const values = axes[key];
    const newCombos: VariantAttributes[] = [];

    for (const combo of combos) {
      for (const value of values) {
        newCombos.push({
          ...combo,
          [key]: value,
        });
      }
    }

    combos = newCombos;
  }

  return combos;
};
const computeVariantImages = (
  product: ProductDocument,
  attributes: Record<string, string>,
): string[] => {
  const colorValue = attributes.color;

  if (!colorValue) return [];

  const imagesForColor = product.images.filter(
    (img) => img.attributes.color === colorValue,
  );

  return imagesForColor.map((img) => img.sizes.thumbnail);
};
const generateSku = (
  title: string,
  attributes: Record<string, string>,
): string => {
  const titlePart = title.split(" ").slice(0, 2).join("").toUpperCase();

  const attrPart = Object.values(attributes)
    .map((v) =>
      v
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, ""),
    )
    .join("-");

  return `${titlePart}-${attrPart}`;
};
const getProductQueryCacheKey = (
  prefix: string,
  query: Record<string, any>,
) => {
  const sortedParams = Object.keys(query)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = query[key];
      return acc;
    }, {});
  // const hash = crypto.createHash("sha256").update(JSON.stringify(sortedParams)).digest("hex");
  // return `${prefix}:${hash}`;
  const stringifiedParams = JSON.stringify(sortedParams);
  const key = makeCacheKey(prefix, stringifiedParams);
  return key;
};
const productCardFields = {
  productId: 1,
  title: 1,
  brandName: 1,
  colors: 1,
  categoryPath: 1,
  properties: 1,
};
// product.services.ts

const resolveColorAxisKey = (variantAxes: string[]): string | null => {
  const possible = ["color", "Color", "colour", "Colour"];
  return variantAxes.find((axis) => possible.includes(axis)) || null;
};

const cleanupInvalidColorImages = async (
  product: any,
  allowedColors: string[],
) => {
  if (!product.images || product.images.length === 0) {
    return { deletedImages: [] };
  }

  const imagesToDelete = product.images.filter(
    (img: any) =>
      img.attributes?.color && !allowedColors.includes(img.attributes.color),
  );

  if (imagesToDelete.length === 0) {
    return { deletedImages: [] };
  }

  const deletableImages: any[] = [];

  for (const image of imagesToDelete) {
    // const isThumbnailUsedInOrder = await ItemOrderModel.exists({
    //   image: image.sizes?.thumbnail,
    // });
    const isThumbnailUsedInOrder = false;
    //TODO: Implement actual check with ItemOrderModel to prevent deletion of images used in orders
    // If thumbnail is used in an order, skip deletion
    if (isThumbnailUsedInOrder) continue;

    deletableImages.push(image);
  }

  if (deletableImages.length > 0) {
    product.images = product.images.filter(
      (img: any) => !deletableImages.some((del) => del.name === img.name),
    );

    // Ensure default image integrity
    const hasDefault = product.images.some((img: any) => img.isDefault);

    if (!hasDefault && product.images.length > 0) {
      product.images[0].isDefault = true;
    }
  }

  return { deletedImages: deletableImages };
};

const deleteFirebaseProductImages = async (images: ProductImage[]) => {
  for (const image of images) {
    try {
      const urls = Object.values(image.sizes);

      for (const url of urls) {
        const path = decodeURIComponent(url.split(`${BUCKET_NAME}/`)[1]);
        await storageRef
          .file(path)
          .delete()
          .catch(() => {});
      }
    } catch (error) {
      console.error("Firebase deletion failed:", error);
    }
  }
};

const generateFacets = async (baseMatch: any, category_id?: string) => {
  const facetStages: Record<string, any[]> = {};

  facetStages.brand = [
    {
      $match: { brandSlug: { $exists: true, $ne: null } },
    },
    {
      $group: {
        _id: "$brandSlug",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];

  /**
   * ----------------------------
   *  Color facet (if colors array exists)
   * ----------------------------
   */
  facetStages.color = [
    { $unwind: "$colors" },
    {
      $group: {
        _id: "$colors.value",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ];

  /**
   * ----------------------------
   * Category-based dynamic properties
   * ----------------------------
   */
  if (category_id) {
    const category = getCategoryById(category_id);

    if (category?.isLeaf) {
      const properties = getCategoryProperties(category_id);

      properties
        .filter((prop) => prop.filterable === true && prop.usage !== "system")
        .forEach((prop) => {
          const fieldPath = `properties.${prop.name}`;

          facetStages[prop.name] = [
            {
              $match: {
                [fieldPath]: { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: `$${fieldPath}`,
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ];
        });
    }
  }

  const result = await ProductModel.aggregate([
    { $match: baseMatch },
    { $facet: facetStages },
  ]);

  const rawFacets = result[0] || {};

  /**
   * ----------------------------
   *  Normalize Output
   * ----------------------------
   */
  const filters = Object.entries(rawFacets).map(([key, values]: any) => ({
    key,
    type: "enum",
    options: values.map((v: any) => ({
      value: v._id,
      count: v.count,
    })),
  }));

  return filters;
};

const deleteProductsRedisCache = async () => {
  const productRedisKeyPrefixes = [
    "productDetails",
    "liveProducts",
    "catalogProducts",
    "searchProducts",
  ];
  for (const prefix of productRedisKeyPrefixes) {
    await deleteRedisKeysByPrefix(prefix);
  }
};

export {
  generateProductId,
  generateCombinations,
  computeVariantImages,
  generateSku,
  getProductQueryCacheKey,
  productCardFields,
  resolveColorAxisKey,
  cleanupInvalidColorImages,
  deleteFirebaseProductImages,
  generateFacets,
  deleteProductsRedisCache,
};
