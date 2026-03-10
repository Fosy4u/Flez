import mongoose from "mongoose";
import "dotenv/config";
import slugify from "slugify";
import { BrandModel } from "../src/models/brand.model";
import dbConfig from "../src/config/db";

// ----------------------
// TypeScript type for seed brands
// ----------------------
type BrandSeed = {
  name: string;
  departments: string[];
  type: "official" | "generic";
};

// ----------------------
// Seed function
// ----------------------
const seedBrands = async () => {
  if (process.env.ALLOW_SEED !== "true") {
    console.log("Seeding skipped. Set ALLOW_SEED=true to run this script.");
    return;
  }

  await mongoose.connect(dbConfig.url);
  console.log("✅ Connected to MongoDB for brand seeding");

  const allDepartments = [
    "Men's Wear",
    "Women's Wear",
    "Babies & Kids",
    "Beauty & Skincare",
    "Wigs Extensions & Haircare",
    "Phones & Accessories",
    "Computers & Accessories",
    "Home & Kitchen Appliances",
  ];

  // ----------------------
  // Fashion brands (all mapped to relevant fashion departments)
  // ----------------------
  const fashionBrandNames = [
    "Adidas","Nike","Puma","Reebok","Under Armour","New Balance","Asics","Converse","Vans","Fila",
    "Skechers","Salomon","Merrell","Brooks","Hoka One One","Altra","Saucony","Mizuno","Karhu",
    "La Sportiva","Inov-8","Topo Athletic","John Lobb","Arc'teryx","Icebug","Scarpa","Dynafit",
    "Salming","Vibram","Lems","Xero Shoes","Luna Sandals","Bedrock Sandals","Earth Runners",
    "Shamma Sandals","Unshoes","Vivobarefoot","Preety Little Thing","Zara","Boohoo","H&M",
    "Forever 21","ASOS","Mango","Topshop","Topman","Tommy Hilfiger","Calvin Klein","Levi's",
    "Wrangler","Lee","Gucci","Other"
  ];

  const brands: BrandSeed[] = fashionBrandNames.map((name) => ({
    name,
    departments: ["Men's Wear", "Women's Wear", "Babies & Kids"],
    type: name === "Other" ? "generic" : "official",
  }));

  // ----------------------
  // Other official brands by department
  // ----------------------
  const otherBrands: BrandSeed[] = [
    // Babies & Kids
    { name: "Carter's", departments: ["Babies & Kids"], type: "official" },
    { name: "Baby Gap", departments: ["Babies & Kids"], type: "official" },
    { name: "Chicco", departments: ["Babies & Kids"], type: "official" },
    { name: "Fisher-Price", departments: ["Babies & Kids"], type: "official" },
    { name: "Pampers", departments: ["Babies & Kids"], type: "official" },
    { name: "Mothercare", departments: ["Babies & Kids"], type: "official" },
    { name: "Disney", departments: ["Babies & Kids"], type: "official" },
    { name: "Lego", departments: ["Babies & Kids"], type: "official" },
    { name: "Barbie", departments: ["Babies & Kids"], type: "official" },

    // Beauty & Skincare
    { name: "Nivea", departments: ["Beauty & Skincare"], type: "official" },
    { name: "L'Oreal", departments: ["Beauty & Skincare"], type: "official" },
    { name: "Dove", departments: ["Beauty & Skincare"], type: "official" },
    { name: "Maybelline", departments: ["Beauty & Skincare"], type: "official" },
    { name: "Fenty Beauty", departments: ["Beauty & Skincare"], type: "official" },
    { name: "MAC", departments: ["Beauty & Skincare"], type: "official" },
    { name: "Clinique", departments: ["Beauty & Skincare"], type: "official" },
    { name: "The Ordinary", departments: ["Beauty & Skincare"], type: "official" },
    { name: "Neutrogena", departments: ["Beauty & Skincare"], type: "official" },
    { name: "Olay", departments: ["Beauty & Skincare"], type: "official" },

    // Wigs & Haircare
    { name: "Outre", departments: ["Wigs Extensions & Haircare"], type: "official" },
    { name: "Bobbi Boss", departments: ["Wigs Extensions & Haircare"], type: "official" },
    { name: "Sensationnel", departments: ["Wigs Extensions & Haircare"], type: "official" },
    { name: "Motown Tress", departments: ["Wigs Extensions & Haircare"], type: "official" },
    { name: "Sleek", departments: ["Wigs Extensions & Haircare"], type: "official" },
    { name: "Harlem 125", departments: ["Wigs Extensions & Haircare"], type: "official" },

    // Phones & Accessories
    { name: "Samsung", departments: ["Phones & Accessories", "Home & Kitchen Appliances"], type: "official" },
    { name: "Apple", departments: ["Phones & Accessories"], type: "official" },
    { name: "Tecno", departments: ["Phones & Accessories"], type: "official" },
    { name: "Infinix", departments: ["Phones & Accessories"], type: "official" },
    { name: "Huawei", departments: ["Phones & Accessories"], type: "official" },
    { name: "Xiaomi", departments: ["Phones & Accessories"], type: "official" },
    { name: "Oppo", departments: ["Phones & Accessories"], type: "official" },
    { name: "Nokia", departments: ["Phones & Accessories"], type: "official" },

    // Computers & Accessories
    { name: "HP", departments: ["Computers & Accessories"], type: "official" },
    { name: "Dell", departments: ["Computers & Accessories"], type: "official" },
    { name: "Lenovo", departments: ["Computers & Accessories"], type: "official" },
    { name: "Asus", departments: ["Computers & Accessories"], type: "official" },
    { name: "Acer", departments: ["Computers & Accessories"], type: "official" },
    { name: "Microsoft", departments: ["Computers & Accessories"], type: "official" },
    { name: "Logitech", departments: ["Computers & Accessories"], type: "official" },

    // Home & Kitchen Appliances
    { name: "Philips", departments: ["Home & Kitchen Appliances"], type: "official" },
    { name: "LG", departments: ["Home & Kitchen Appliances"], type: "official" },
    { name: "Bosch", departments: ["Home & Kitchen Appliances"], type: "official" },
    { name: "Midea", departments: ["Home & Kitchen Appliances"], type: "official" },
    { name: "Kenwood", departments: ["Home & Kitchen Appliances"], type: "official" },
    { name: "Panasonic", departments: ["Home & Kitchen Appliances"], type: "official" },
  ];

  brands.push(...otherBrands);

  // ----------------------
  // Generic / brandless options
  // ----------------------
  const genericBrands: BrandSeed[] = [
    { name: "No Brand", departments: allDepartments, type: "generic" },
    { name: "Imported", departments: allDepartments, type: "generic" },
    { name: "OEM", departments: allDepartments, type: "generic" },
    { name: "Local Brand", departments: allDepartments, type: "generic" },
    { name: "Unbranded", departments: allDepartments, type: "generic" },
    { name: "Other", departments: allDepartments, type: "generic" },
  ];

  brands.push(...genericBrands);

  // ----------------------
  // Insert into DB
  // ----------------------
  for (const b of brands) {
    const slug = slugify(b.name, { lower: true, strict: true });
    const exists = await BrandModel.findOne({ slug });

    if (!exists) {
      await BrandModel.create({
        ...b,
        slug,
        isApproved: true,
        isFilterable: true,
        isActive: true,
      });
      console.log(`Seeded brand: ${b.name}`);
    }
  }

  console.log("✅ Brand seeding completed!");
  await mongoose.disconnect();
};

seedBrands().catch((err) => {
  console.error("❌ Brand seeding failed:", err);
  mongoose.disconnect();
});
