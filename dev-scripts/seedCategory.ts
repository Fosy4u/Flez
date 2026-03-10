import mongoose from "mongoose";
import "dotenv/config";
import { CategoryModel } from "../src/models/category.model";
import { mendAndWomenCategories } from "../src/data/wear-categories.data";
import { babyAndKidsCategories } from "../src/data/baby-and-kids-categories.data";
import { beautyAndSkincareCategories } from "../src/data/beauty-skin-care-categories.data";
import {wigEextensionAndHairCareCategories} from "../src/data/wig-categories.data";
import { phoneAndAccessoriesCategories } from "../src/data/phone-accessories-categories.data";
import { computerAndAccessoriesCategories } from "../src/data/computer-and-accessories.data";
import { homeKitchenCategories } from "../src/data/home-kitchen-categories.data";

import dbConfig from "../src/config/db";

const categories = [...mendAndWomenCategories, ...babyAndKidsCategories, ...beautyAndSkincareCategories, ...wigEextensionAndHairCareCategories, 
  ...phoneAndAccessoriesCategories, ...computerAndAccessoriesCategories, ...homeKitchenCategories];

const checkDuplicatesPaths = () =>{
  const seen = new Map();
const duplicates = [];

for (const item of categories) {
  if (seen.has(item.path)) {
    duplicates.push(item);
  } else {
    seen.set(item.path, true);
  }
}

console.log(duplicates);
return duplicates;

}

const connectDB = async () => {
  await mongoose.connect(dbConfig.url);
};

const seedCategories = async () => {
  console.log("🌱 Seeding categories...");

  // Clear existing categories
  // await CategoryModel.deleteMany({});
  // console.log("🧹 Existing categories cleared");
  
  // check for duplicate paths
  const duplicatePaths = checkDuplicatesPaths();


  if (duplicatePaths.length > 0) {
    console.error("❌ Duplicate category paths found:", duplicatePaths);
    process.exit(1);
  }
  console.log("✅ No duplicate category paths found.");

  /**
   * PASS 1
   * Insert all categories WITHOUT parent_id
   */
  const insertedCategories = await CategoryModel.insertMany(
    categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      path: cat.path,
      properties: cat.properties ?? [],
      isActive: cat.isActive ?? true,
      parent_id: null,
     
    }))
  );

  console.log(`✅ Inserted ${insertedCategories.length} categories`);
 


  /**
   * Build lookup map: path → _id
   */
  const pathToIdMap = new Map<string, mongoose.Types.ObjectId>();
  insertedCategories.forEach((cat) => {
    pathToIdMap.set(cat.path, cat._id);
  });

  /**
   * PASS 2
   * Resolve parent_id from path
   */
  for (const category of insertedCategories) {
    const pathParts = category.path.split("/");

    // Root categories have no parent
    if (pathParts.length === 1) continue;

    const parentPath = pathParts.slice(0, -1).join("/");
    const parentId = pathToIdMap.get(parentPath);

    if (!parentId) {
      console.warn(
        `⚠️ Parent not found for category: ${category.path}`
      );
      continue;
    }

    await CategoryModel.updateOne(
      { _id: category._id },
      { parent_id: parentId, parentSlug: parentPath.split("/").pop() || null }
    );
  }

  console.log("🌳 Parent relationships resolved");
  
};

const run = async () => {
  try {
    await connectDB();
    await seedCategories();
    console.log("🎉 Category seeding completed successfully");
  } catch (error) {
    console.error("❌ Category seeding failed", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
