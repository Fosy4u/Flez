import mongoose from "mongoose";
import "dotenv/config";

import dbConfig from "../src/config/db";
import { CategoryModel } from "../src/models/category.model";
import { mendAndWomenCategories } from "../src/data/wear-categories.data";
import { babyAndKidsCategories } from "../src/data/baby-and-kids-categories.data";
import { beautyAndSkincareCategories } from "../src/data/beauty-skin-care-categories.data";
import {wigEextensionAndHairCareCategories} from "../src/data/wig-categories.data";
import { phoneAndAccessoriesCategories } from "../src/data/phone-accessories-categories.data";
import { computerAndAccessoriesCategories } from "../src/data/computer-and-accessories.data";
import { homeKitchenCategories } from "../src/data/home-kitchen-categories.data";
import { runSeeder } from "./seed.utils";

const categories = [...mendAndWomenCategories, ...babyAndKidsCategories, ...beautyAndSkincareCategories, ...wigEextensionAndHairCareCategories, 
  ...phoneAndAccessoriesCategories, ...computerAndAccessoriesCategories, ...homeKitchenCategories];

async function resolveParents() {
  const all = await CategoryModel.find({}, { _id: 1, path: 1 });

  const pathToId = new Map(
    all.map((c) => [c.path, c._id])
  );

  const updates = [];

  for (const cat of all) {
    const parts = cat.path.split("/");

    if (parts.length === 1) continue;

    const parentPath = parts.slice(0, -1).join("/");
    const parentId = pathToId.get(parentPath);

    if (!parentId) continue;

    updates.push({
      updateOne: {
        filter: { _id: cat._id },
        update: { parent_id: parentId },
      },
    });
  }

  if (updates.length) {
    await CategoryModel.bulkWrite(updates);
  }

  console.log("🌳 Parent relationships resolved");
}

async function run() {
  await mongoose.connect(dbConfig.url);

  await runSeeder({
    model: CategoryModel,
    data: categories,
    logLabel: "Category Seeder",
  });

  await resolveParents();

  await mongoose.disconnect();

  console.log("🎉 All done");
}

run();
