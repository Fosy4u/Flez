import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { CategoryModel } from "../src/models/category.model";
import { ProductModel } from "../src/models/product.model";
import { BrandModel } from "../src/models/brand.model";
import { ShopModel } from "../src/models/shop.model";
import {
  generateProductId,
  generateCombinations,
  generateSku,
} from "../src/services/product.service";
import dotenv from "dotenv";
dotenv.config();
import { ENV } from "../src/config/env.config";
import dbConfig from "../src/config/db";
import { redis } from "../src/cache/redis";
import {
  MEGA_MENU_CACHE_KEY,
  refreshCategoryCache,
} from "../src/services/category.service";

if (ENV !== "dev") {
  console.error("Seeding is only allowed in development environment");
  process.exit(1);
}

const SHOP_ID = new mongoose.Types.ObjectId("69ab1e0bc094601a4d30aa82");

const PRODUCTS_PER_CATEGORY = 25;

/**
 * Random helper
 */
const randomFromArray = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

/**
 * Placeholder images
 */
const generateImage = (
  color: string,
  index: number,
  brand: string,
  category: string,
) => {
  const seed = faker.string.alphanumeric(10);

  return {
    name: `img_${seed}_${index}.jpg`,
    sizes: {
      thumbnail: `https://picsum.photos/seed/${seed}/200/200?text=${brand}+${category}+${color}`,
      medium: `https://picsum.photos/seed/${seed}/800/800?text=${brand}+${category}+${color}`,
      large: `https://picsum.photos/seed/${seed}/1500/1500?text=${brand}+${category}+${color}`,
    },
    isDefault: index === 0,
    attributes: {
      color,
    },
  };
};

function generateProductTitle(brand: string, categorySlug: string) {
  const categoryKeywords: Record<string, string[]> = {
    phones: ["Phone Case", "Screen Protector", "USB-C Charger"],
    laptops: ["Laptop Backpack", "Laptop Sleeve", "Wireless Mouse"],
    beauty: ["Face Cream", "Vitamin Serum", "Body Lotion"],
    "babies-kids": ["Baby Bodysuit", "Kids Hoodie", "Baby Blanket"],
    sports: ["Running Shoes", "Training Shorts", "Gym Backpack"],
  };

  const descriptors = [
    "Premium",
    "Pro",
    "Ultra",
    "Classic",
    "Lightweight",
    "Comfort Fit",
  ];

  const keywords = categoryKeywords[categorySlug] || ["Product"];
  const keyword = faker.helpers.arrayElement(keywords);
  const descriptor = faker.helpers.arrayElement(descriptors);

  return `${brand} ${descriptor} ${keyword}`;
}

const seedProducts = async () => {
  await mongoose.connect(dbConfig.url);

  console.log("✅ Connected to MongoDB");

  /**
   * -------------------------
   * Load categories
   * -------------------------
   */
  const categories = await CategoryModel.find({
    properties: { $exists: true, $ne: [] },
  }).lean();

  if (!categories.length) {
    console.error("❌ No categories found");
    process.exit(1);
  }

  /**
   * -------------------------
   * Load root categories
   * -------------------------
   */
  const rootCategories = await CategoryModel.find({
    parent_id: null,
  }).lean();

  const rootCategoryMap = new Map(rootCategories.map((c) => [c.slug, c.name]));

  /**
   * -------------------------
   * Load brands
   * -------------------------
   */
  const brands = await BrandModel.find({
    isActive: true,
    isApproved: true,
  }).lean();

  if (!brands.length) {
    console.error("❌ No brands found. Seed brands first.");
    process.exit(1);
  }
  const shop = await ShopModel.findById(SHOP_ID);

  if (!shop) {
    console.error("❌ Shop not found. Please create the shop first.");
    process.exit(1);
  }

  /**
   * -------------------------
   * Group brands by department
   * -------------------------
   */
  const brandsByDepartment: Record<string, any[]> = {};

  for (const brand of brands) {
    for (const dept of brand.departments) {
      if (!brandsByDepartment[dept]) {
        brandsByDepartment[dept] = [];
      }
      brandsByDepartment[dept].push(brand);
    }
  }

  const products: any[] = [];

  /**
   * -------------------------
   * Generate products
   * -------------------------
   */
  for (const category of categories) {
    console.log(`Generating products for ${category.path}`);

    const rootSlug = category.path.split("/")[0];
    const department = rootCategoryMap.get(rootSlug);

    const brandPool = brandsByDepartment[department as string] || brands;

    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
      const properties: Record<string, any> = {};
      const variantAxes: Record<string, string[]> = {};

      /**
       * Generate properties
       */
      if (category.properties) {
        for (const prop of category.properties) {
          const values = prop.enumValues || [];

          if (prop.type === "enum" && values.length) {
            if (prop.usage === "variant") {
              variantAxes[prop.name] = faker.helpers.arrayElements(values, {
                min: 1,
                max: Math.min(values.length, 3),
              });
            } else {
              properties[prop.name] = randomFromArray(values);
            }
          }
        }
      }

      const productId = await generateProductId(shop.shopId);
      const brand = randomFromArray(brandPool);
      const title = generateProductTitle(brand.name, category.slug);

      /**
       * Variant combinations
       */
      const combos = generateCombinations(variantAxes);

      const variants = combos.map((combo) => ({
        sku: generateSku(title, combo),
        price: faker.number.int({ min: 10, max: 250 }),
        stock: faker.number.int({ min: 0, max: 50 }),
        attributes: combo,
      }));

      /**
       * Colors
       */
      const colorAxisKey = Object.keys(variantAxes).find(
        (k) => k.toLowerCase() === "color",
      );

      const colors = colorAxisKey
        ? variantAxes[colorAxisKey].map((c) => ({
            value: c,
            hasUploadedImage: true,
          }))
        : [];

      /**
       * Images per color
       */
      const images: any[] = [];

      colors.forEach((color) => {
        const imageCount = faker.number.int({ min: 2, max: 4 });

        for (let i = 0; i < imageCount; i++) {
          images.push(generateImage(color.value, i, brand.name, category.name));
        }
      });
      /**
       * Build product
       */
      const searchText = [
        title,
        faker.commerce.productDescription(),
        brand.name,
        category.path,
        ...Object.values(properties || {}),
        ...Object.values(variantAxes || {}),
      ]
        .join(" ")
        .toLowerCase();
      products.push({
        title,
        productId,
        description: faker.commerce.productDescription(),

        brandName: brand.name,
        brandSlug: brand.slug,

        shop: SHOP_ID,

        category: category._id,
        categoryPath: category.path,

        status: "live",
        disabled: false,
        hasMultipleVariants: variants.length > 1,

        lastStage: "variants",

        properties,
        variantProperties: variantAxes,

        colors,
        images,
        variants,

        searchText,
        rejectionReasons: [],
        timeLine: [],
      });
    }
  }

  /**
   * -------------------------
   * Delete existing fake products
   * -------------------------
   */
  const deleteExisting = await ProductModel.deleteMany({
    shop: SHOP_ID,
  });

  console.log(`Deleted ${deleteExisting.deletedCount} existing products`);

  console.log(`Inserting ${products.length} products...`);

  await ProductModel.insertMany(products);

  console.log("🎉 Product seeding completed");
  await redis.del(MEGA_MENU_CACHE_KEY); // Invalidate mega menu cache to reflect new live product
  await refreshCategoryCache(); // Refresh category cache to update active leaf categories
  await redis.flushDb();

  await mongoose.disconnect();
  process.exit(0);
};

seedProducts().catch((err) => {
  console.error("❌ Product seeding failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
