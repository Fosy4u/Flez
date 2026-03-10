// controllers/product.controller.ts
import e, { Request, Response } from "express";
import { ProductModel } from "../models/product.model";
import { BrandModel } from "../models/brand.model";
import { ShopModel } from "../models/shop.model";
import {
  getFullCategoryTree,
  MEGA_MENU_CACHE_KEY,
} from "../services/category.service";
import { getCategoryById } from "../services/category.service";
import {
  cleanupInvalidColorImages,
  deleteFirebaseProductImages,
  generateCombinations,
  generateFacets,
  generateProductId,
  generateSku,
  getProductQueryCacheKey,
  productCardFields,
  resolveColorAxisKey,
} from "../services/product.service";
import { v4 as uuid } from "uuid";
import { storageRef } from "../config/firebase";
import { SaveVariantPayload } from "../types/product.types";
import { productStatusEnums } from "../helpers/constants";
import { deleteRedisKeysByPrefix, makeCacheKey, redis } from "../cache/redis";
import { deleteImageFromFirebase } from "../helpers/utils";

// --------------------
// Helper: Strip properties for add-product tree
// --------------------
const stripCategoryProperties = (categories: any[]): any[] => {
  return categories.map((cat) => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    path: cat.path,
    parent_id: cat.parent_id,
    children: cat.children ? stripCategoryProperties(cat.children) : [],
    isLeaf: cat.isLeaf,
    hasChildren: cat.hasChildren,
  }));
};

// --------------------
// GET: Add product categories
// --------------------
const getCategoryTreeForProductController = async (
  req: Request,
  res: Response,
) => {
  try {
    const categories = getFullCategoryTree();
    const stripped = stripCategoryProperties(categories);

    return res.status(200).send({
      message: "Categories fetched successfully",
      data: stripped,
    });
  } catch (error) {
    console.error("Get add-product categories error:", error);
    return res.status(500).send({ error: "Unable to fetch categories" });
  }
};

// --------------------
// Stage 1: Add Basic Info + Leaf Category
// --------------------
const addEditProductBasicInfoController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { shopId } = req.cachedUser || {};
    const { productId, title, description, brand_slug, category_path, mode } =
      req.body;

    if (!shopId)
      return res
        .status(401)
        .send({ error: "Unauthorized. We can't identify your shop" });
    if (!brand_slug)
      return res.status(400).send({ error: "Brand slug is required" });
    if (!category_path)
      return res.status(400).send({ error: "Leaf category path is required" });
    if (!title) {
      return res.status(400).send({ error: "Title is required" });
    }
    if (!description) {
      return res.status(400).send({ error: "Description is required" });
    }

    if (mode !== "add" && mode !== "edit")
      return res
        .status(400)
        .send({ error: "Mode must be either 'add' or 'edit'" });
    if (mode === "edit" && !productId)
      return res
        .status(400)
        .send({ error: "productId is required for edit mode" });
    if (mode === "add" && productId)
      return res
        .status(400)
        .send({ error: "productId should not be provided for add mode" });

    // Fetch shop and brand in parallel
    const [shop, brand] = await Promise.all([
      ShopModel.findOne({ shopId }).lean(),
      BrandModel.findOne({ slug: brand_slug }).lean(),
    ]);

    if (!shop) return res.status(404).send({ error: "Shop not found" });
    if (shop.status !== "active")
      return res
        .status(403)
        .send({ error: "Your shop is not active. Please contact support." });
    if (!brand) return res.status(404).send({ error: "Brand not found" });

    // Validate category (must exist and be a leaf)
    const allCategories = getFullCategoryTree();
    const categoryMap = new Map<string, any>();
    const buildMap = (nodes: any[]) =>
      nodes.forEach((node) => {
        categoryMap.set(node.path.toLowerCase(), node);
        if (node.children) buildMap(node.children);
      });
    buildMap(allCategories);

    const category = categoryMap.get(category_path.toLowerCase());
    if (!category) return res.status(404).send({ error: "Category not found" });
    if (!category.isLeaf)
      return res
        .status(400)
        .send({ error: "Selected category must be a leaf category" });
    if (productId) {
      const existingProduct = await ProductModel.findOne({
        productId,
        shop: shop._id,
      }).exec();
      if (!existingProduct)
        return res
          .status(404)
          .send({ error: "Product with given productId not found" });
      if (existingProduct.shop.toString() !== shop._id.toString())
        return res
          .status(403)
          .send({ error: "Unauthorized to edit this product" });
      if (existingProduct.status !== "draft")
        return res
          .status(400)
          .send({ error: "Only products in draft status can be edited" });

      // Update basic info
      existingProduct.title = title;
      existingProduct.description = description;
      existingProduct.brandName = brand.name;
      existingProduct.brandSlug = brand.slug;
      existingProduct.category = category._id;
      existingProduct.categoryPath = category.path;
      existingProduct.lastStage = "basicInfo";
      await existingProduct.save();

      return res.status(200).send({
        message: "Product basic info updated successfully",
        data: {
          productId: existingProduct.productId,
          title: existingProduct.title,
          lastStage: existingProduct.lastStage,
          status: existingProduct.status,
        },
      });
    } else {
      const newProductId = await generateProductId(shop.shopId);

      // Create product
      const product = new ProductModel({
        title,
        description,
        productId: newProductId,
        brandName: brand.name,
        brandSlug: brand.slug,
        shop: shop._id,
        status: "draft",
        disabled: false,
        lastStage: "basicInfo",
        category: category._id,
        categoryPath: category.path,
        rejectionReasons: [],
      });

      await product.save();

      return res.status(201).send({
        message: "Product created successfully (Stage 1: Basic Info)",
        data: {
          productId: product.productId,
          title: product.title,
          lastStage: product.lastStage,
          status: product.status,
        },
      });
    }
  } catch (error) {
    console.error("Add product stage 1 error:", error);
    return res.status(500).send({ error: "Unable to create product" });
  }
};

// --------------------
// Stage 2: Get  Properties
// --------------------
const getProductCategoryPropertiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findOne({ productId }).lean();
    if (!product) return res.status(404).send({ error: "Product not found" });
    const category = getCategoryById(product.category.toString());
    if (!category) return res.status(404).send({ error: "Category not found" });

    const nonVariantProperties = (category.properties || [])
      .filter((prop) => prop.usage !== "variant")
      .map((prop) => ({
        key: prop.key,
        name: prop.name,
        type: prop.type,
        enumValues: prop.enumValues || [],
        required: prop.required || false,
        filterable: prop.filterable || false,
      }));

    const variantProperties = (category.properties || [])
      .filter((prop) => prop.usage === "variant")
      .map((prop) => ({
        key: prop.key,
        name: prop.name,
        type: prop.type,
        enumValues: prop.enumValues || [],
        required: prop.required || false,
        filterable: prop.filterable || false,
      }));

    return res.status(200).send({
      message: "Product properties fetched successfully",
      data: {
        nonVariantProperties,
        variantProperties,
      },
    });
  } catch (error) {
    console.error("Get product properties error:", error);
    return res.status(500).send({ error: "Unable to fetch properties" });
  }
};

// --------------------
// Stage 2: Save Non-Variant Property Values
// --------------------
const saveProductCategoryPropertiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params;
    const { properties } = req.body;

    if (!properties || typeof properties !== "object") {
      return res.status(400).send({
        error: "Properties must be provided as key-value pairs",
      });
    }

    const product = await ProductModel.findOne({ productId }).exec();
    if (!product) return res.status(404).send({ error: "Product not found" });

    if (product.status !== "draft") {
      return res.status(400).send({
        error: "Only products in draft status can be edited",
      });
    }

    const category = getCategoryById(product.category.toString());

    if (!category) return res.status(404).send({ error: "Category not found" });

    const categoryProperties = category.properties || [];

    const nonVariantProps = categoryProperties.filter(
      (prop: any) => prop.usage !== "variant",
    );

    const allowedKeys = nonVariantProps.map((p: any) => p.name.toLowerCase());

    const missingRequired: string[] = [];

    for (const prop of nonVariantProps) {
      if (prop.required) {
        const value = properties[prop.name.toLowerCase()];
        if (value === undefined || value === null || value === "") {
          missingRequired.push(prop.name);
        }
      }
      // ensure values of properties matches the allowed enum values if type is enum
      if (prop.type === "enum" && prop.enumValues) {
        const value = properties[prop.name.toLowerCase()];
        // if value is not string, throw error as non-variant properties must be string and not array
        if (typeof value !== "string") {
          return res.status(400).send({
            error: `Property '${prop.name}' must be a string`,
          });
        }
        const enumValues = prop.enumValues.map((v: string) => v.toLowerCase());
        if (value && !enumValues.includes(value.toLowerCase())) {
          return res.status(400).send({
            error: `Invalid value for property '${prop.name}': ${value}. valid values are: ${prop.enumValues.join(", ")}`,
          });
        }
      }
    }

    if (missingRequired.length > 0) {
      return res.status(400).send({
        error: `Missing required properties: ${missingRequired.join(", ")}`,
      });
    }

    // Only allow category-defined keys
    const sanitized: Record<string, any> = {};

    for (const key of Object.keys(properties)) {
      if (allowedKeys.includes(key)) {
        sanitized[key] = properties[key].toLowerCase();
      }
    }

    product.properties = {
      ...product.properties,
      ...sanitized,
    };

    product.lastStage = "categoryProperties";

    await product.save();

    return res.status(200).send({
      message: "Category properties saved successfully",
      data: {
        productId: product.productId,
        properties: product.properties,
        lastStage: product.lastStage,
      },
    });
  } catch (error) {
    console.error("Save category properties error:", error);
    return res.status(500).send({
      error: "Unable to save category properties",
    });
  }
};

// --------------------
// Stage 3: Save Variant Property Options
// --------------------
const saveProductVariantPropertiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params;
    const { variantProperties } = req.body;

    if (!variantProperties || typeof variantProperties !== "object") {
      return res.status(400).send({
        error: "variantProperties must be provided as key → string[]",
      });
    }

    const product = await ProductModel.findOne({ productId }).exec();
    if (!product) return res.status(404).send({ error: "Product not found" });

    if (product.status !== "draft") {
      return res.status(400).send({
        error: "Only products in draft status can be edited",
      });
    }

    const category = getCategoryById(product.category.toString());
    if (!category) return res.status(404).send({ error: "Category not found" });

    const categoryProperties = category.properties || [];

    const variantAxes = categoryProperties
      .filter((prop: any) => prop.usage === "variant")
      .map((prop: any) => prop.name.toLowerCase());
    //ensure all variant keys are present in the category properties

    const missingAxes = variantAxes.filter(
      (axis) =>
        !Object.keys(variantProperties)
          .map((key) => key.toLowerCase())
          .includes(axis.toLowerCase()),
    );
    if (missingAxes.length > 0) {
      return res.status(400).send({
        error: `Missing variant properties: ${missingAxes.join(", ")}`,
      });
    }

    for (const key of Object.keys(variantProperties)) {
      if (!variantAxes.includes(key.toLowerCase())) {
        return res.status(400).send({
          error: `Invalid variant property: ${key}`,
        });
      }

      const values = variantProperties[key];

      if (!Array.isArray(values) || values.length === 0) {
        return res.status(400).send({
          error: `Variant property '${key}' must have at least one value and has to be an array`,
        });
      }
      // check if all values are strings
      if (!values.every((v: any) => typeof v === "string")) {
        return res.status(400).send({
          error: `All values for variant property '${key}' must be strings`,
        });
      }
      // If property is of type enum, validate values against allowed enum values
      const categoryProp = categoryProperties.find(
        (prop: any) => prop.name.toLowerCase() === key,
      );
      if (
        categoryProp &&
        categoryProp.type === "enum" &&
        categoryProp.enumValues
      ) {
        const invalidValues = values.filter(
          (value: string) => !categoryProp.enumValues!.includes(value),
        );
        if (invalidValues.length > 0) {
          return res.status(400).send({
            error: `Invalid values for variant property '${key}': ${invalidValues.join(", ")}. Valid values are: ${categoryProp.enumValues.join(", ")}`,
          });
        }
      }
    }

    // Resolve color axis
    const colorAxis = resolveColorAxisKey(variantAxes);

    if (!colorAxis || !variantProperties[colorAxis]) {
      return res.status(400).send({
        error: "Variant property 'color' is required",
      });
    }

    const allowedColors = variantProperties[colorAxis];

    /**
     * Cleanup images that no longer match colors
     */
    const { deletedImages } = await cleanupInvalidColorImages(
      product,
      allowedColors,
    );

    /**
     * Compute combination count
     */
    const counts = Object.values(variantProperties).map(
      (arr: any) => arr.length,
    );

    const totalCombinations = counts.reduce((acc, val) => acc * val, 1);

    product.variantProperties = variantProperties;

    product.properties = {
      ...product.properties,
      ...variantProperties,
    };

    product.hasMultipleVariants = totalCombinations > 1;

    product.colors = allowedColors.map((color: string) => ({
      value: color,
      hex: "",
      background: "",
    }));

    product.lastStage = "variantProperties";

    await product.save();
    if (deletedImages.length > 0) {
      await deleteFirebaseProductImages(deletedImages);
    }
    return res.status(200).send({
      message: "Variant properties saved successfully",
      data: {
        productId: product.productId,
        variantProperties: product.variantProperties,
        hasMultipleVariants: product.hasMultipleVariants,
        totalCombinations,
        deletedImagesCount: deletedImages.length,
        lastStage: product.lastStage,
      },
    });
  } catch (error) {
    console.error("Save variant properties error:", error);
    return res.status(500).send({
      error: "Unable to save variant properties",
    });
  }
};
// stage 4
const completeProductImagesStage = async (req: Request, res: Response) => {
  const { productId } = req.params;

  const product = await ProductModel.findOne({ productId });
  if (!product) {
    return res.status(404).send({ error: "Product not found" });
  }
  if (product.status !== "draft") {
    return res
      .status(400)
      .send({ error: "Only products in draft status can be edited" });
  }

  const colors = product.colors || [];

  if (!colors.length) {
    return res.status(400).send({
      error: "No colors configured",
    });
  }

  // Move stage
  product.lastStage = "variants";
  await product.save();

  return res.status(200).send({
    message: "Product images stage completed",
  });
};
// --------------------
// Stage 4: Get Image Upload URL
// --------------------
const getProductImageUploadUrlController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId, color } = req.params;
    const { contentType } = req.query;
    const { shopId, isAdmin, isSuperAdmin } = req.cachedUser || {};

    if (!shopId) {
      return res.status(401).send({
        error: "Unauthorized. Shop not identified",
      });
    }

    if (!contentType || typeof contentType !== "string") {
      return res.status(400).send({
        error: "contentType query param is required",
      });
    }

    if (!contentType.startsWith("image/")) {
      return res.status(400).send({
        error: "Only image uploads are allowed",
      });
    }

    const [shop, product] = await Promise.all([
      ShopModel.findOne({ shopId }).lean(),
      ProductModel.findOne({ productId }).lean(),
    ]);

    if (!shop) {
      return res.status(404).send({ error: "Shop not found" });
    }

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (
      !isAdmin &&
      !isSuperAdmin &&
      product.shop.toString() !== shop._id.toString()
    ) {
      return res.status(403).send({
        error: "Unauthorized to access this product",
      });
    }

    if (product.status !== "draft") {
      return res.status(400).send({
        error: "Images can only be uploaded while product is in draft mode",
      });
    }

    // Validate color exists in variantProperties
    const colorAxis = Object.keys(product.variantProperties || {}).find(
      (key) => key.toLowerCase() === "color" || key.toLowerCase() === "colour",
    );

    if (!colorAxis) {
      return res.status(400).send({
        error: "Color variant not defined yet",
      });
    }

    const allowedColors = product.variantProperties[colorAxis] || [];

    const colorExists = allowedColors.some(
      (c: string) => c.toLowerCase() === color.toLowerCase(),
    );

    if (!colorExists) {
      return res.status(400).send({
        error: "Invalid color",
      });
    }

    // ---------- Generate file path ----------
    const ext = contentType.split("/")[1] || "jpg";
    const fileName = `${Date.now()}_${uuid()}.${ext}`;

    const filePath = `raw/products/${productId}/${fileName}`;

    const file = storageRef.file(filePath);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
      extensionHeaders: {
        "x-goog-meta-productId": productId,
        "x-goog-meta-color": color,
      },
    });

    return res.status(200).send({
      uploadUrl: url,
      filePath,
      metadata: {
        productId,
        color,
      },
    });
  } catch (error) {
    console.error("Generate upload URL error:", error);
    return res.status(500).send({
      error: "Failed to generate upload URL",
    });
  }
};
const markDefaultImageController = async (req: Request, res: Response) => {
  try {
    const { shopId, isAdmin, isSuperAdmin } = req.cachedUser || {};
    const { productId, fileName } = req.body;

    if (!shopId) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    if (!productId) {
      return res.status(400).send({ error: "productId is required" });
    }

    if (!fileName) {
      return res.status(400).send({ error: "fileName is required" });
    }

    const shop = await ShopModel.findOne({ shopId }).lean();
    if (!shop) {
      return res.status(404).send({ error: "Shop not found" });
    }

    const product = await ProductModel.findOne({ productId });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (
      !isAdmin &&
      !isSuperAdmin &&
      product.shop.toString() !== shop._id.toString()
    ) {
      return res.status(403).send({
        error: "You do not have permission to edit this product",
      });
    }

    // Respect your rule: only editable in draft
    if (product.status !== "draft") {
      return res.status(400).send({
        error: "Default image can only be changed in draft mode",
      });
    }

    // Ensure image exists
    const imageExists = product.images?.some(
      (img: any) => img.name === fileName,
    );

    if (!imageExists) {
      return res.status(404).send({
        error: "Image not found in this product",
      });
    }

    // 🔒 Atomic reset + set
    await ProductModel.updateOne(
      { productId, shop: shop._id },
      {
        $set: {
          "images.$[].isDefault": false, // reset all
        },
      },
    );

    await ProductModel.updateOne(
      {
        productId,
        shop: shop._id,
        "images.name": fileName,
      },
      {
        $set: {
          "images.$.isDefault": true,
        },
      },
    );

    return res.send({
      message: "Default image updated successfully",
    });
  } catch (error) {
    console.error("Mark default image error:", error);
    return res.status(500).send({
      error: "Unable to mark default image",
    });
  }
};

// Stage 5 — Get Variant Options
// Get Variant Options

const getVariantOptionsController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findOne({ productId }).lean();

    if (!product) {
      return res.status(404).send({
        error: "Product not found",
      });
    }

    const variantProperties = product.variantProperties || {};

    const combinations = generateCombinations(variantProperties);

    return res.status(200).send({
      message: "Variant options fetched",
      data: {
        axes: variantProperties,
        combinations,
        total: combinations.length,
      },
    });
  } catch (error) {
    console.error("Get variant options error:", error);
    return res.status(500).send({ error: "Unable to fetch options" });
  }
};

// Stage 5 — Save Variants
// Save Product Variants

const saveProductVariantsController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const variants: SaveVariantPayload[] = req.body.variants;

    if (!Array.isArray(variants) || !variants.length) {
      return res.status(400).send({
        error: "Variants payload required",
      });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    const seenCombos = new Set<string>();

    const savedVariants = variants.map((variant) => {
      const { attributes, price, stock } = variant;

      if (!attributes) {
        throw new Error("Variant attributes required");
      }

      if (price < 0 || stock < 0) {
        throw new Error("Invalid price or stock");
      }

      /**
       * Prevent duplicate combos
       */
      const comboKey = JSON.stringify(attributes);

      if (seenCombos.has(comboKey)) {
        throw new Error("Duplicate variant combination");
      }

      seenCombos.add(comboKey);

      const sku = generateSku(product.title, attributes);

      return {
        sku,
        price,
        stock,
        attributes,
      };
    });

    product.variants = savedVariants;

    product.lastStage = "variants";

    await product.save();

    return res.status(200).send({
      message: "Variants saved successfully",
      data: {
        totalVariants: savedVariants.length,
        lastStage: product.lastStage,
      },
    });
  } catch (error: any) {
    console.error("Save variants error:", error);

    return res.status(500).send({
      error: error.message || "Unable to save variants",
    });
  }
};

// stage 6 — Submit for review

// --------------------
// Final Submission: Validate All Stages
// --------------------
const submitProductController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { shopId, isAdmin, isSuperAdmin } = req.cachedUser || {};

    if (!shopId) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const product = await ProductModel.findOne({ productId });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Ownership check
    if (!isAdmin && !isSuperAdmin && product.shop.toString() !== shopId) {
      return res.status(403).send({
        error: "You are not allowed to submit this product",
      });
    }

    if (product.status !== "draft") {
      return res.status(400).send({
        error: "Only draft products can be submitted",
      });
    }

    // Structured error container
    const validation = {
      basicInfo: [] as string[],
      properties: [] as string[],
      variants: [] as string[],
      images: [] as string[],
    };

    // =====================
    // STAGE 1 — BASIC INFO
    // =====================
    if (!product.title?.trim())
      validation.basicInfo.push("Please enter a product title.");

    if (!product.description?.trim())
      validation.basicInfo.push("Please enter a product description.");

    if (!product.brandName) validation.basicInfo.push("Please select a brand.");

    if (!product.category)
      validation.basicInfo.push("Please select a category.");

    const category = product.category
      ? getCategoryById(product.category.toString())
      : null;

    if (!category) {
      validation.basicInfo.push("Selected category is invalid.");
    }

    // =====================
    // STAGE 2 — NON-VARIANT PROPERTIES
    // =====================
    if (category) {
      const requiredProps = (category.properties || []).filter(
        (p: any) => p.usage !== "variant" && p.required,
      );

      for (const prop of requiredProps) {
        const val = product.properties?.[prop.key];
        if (val === undefined || val === null || val === "") {
          validation.properties.push(`Please provide '${prop.name}'.`);
        }
      }
    }

    // =====================
    // STAGE 3 — VARIANT AXES
    // =====================
    const variantProps = product.variantProperties || {};
    const variantAxes = Object.keys(variantProps);

    if (variantAxes.length === 0) {
      validation.variants.push("Please define at least one variant property.");
    }

    for (const [key, values] of Object.entries(variantProps)) {
      if (!Array.isArray(values) || values.length === 0) {
        validation.variants.push(
          `Variant '${key}' must have at least one option.`,
        );
      }
    }

    // =====================
    // STAGE 4 — IMAGES
    // =====================
    const colorAxisKey = variantAxes.find(
      (k) => k.toLowerCase() === "color" || k.toLowerCase() === "colour",
    );

    if (!colorAxisKey) {
      validation.images.push(
        "A color variant is required before uploading images.",
      );
    } else {
      const allowedColors = variantProps[colorAxisKey] || [];
      const images = product.images || [];

      if (images.length === 0) {
        validation.images.push("Please upload at least one product image.");
      }

      // Ensure each color has at least one image
      for (const color of allowedColors) {
        const hasImageForColor = images.some(
          (img: any) =>
            img.attributes?.color?.toLowerCase() === color.toLowerCase(),
        );

        if (!hasImageForColor) {
          validation.images.push(
            `Please upload at least one image for '${color}'.`,
          );
        }
      }

      // Ensure exactly one default
      const defaultCount = images.filter((img: any) => img.isDefault).length;

      if (defaultCount === 0) {
        validation.images.push("Please set a default product image.");
      }

      if (defaultCount > 1) {
        validation.images.push("Only one image can be set as default.");
      }
    }

    // =====================
    // STAGE 5 — VARIANTS
    // =====================
    if (!product.variants || product.variants.length === 0) {
      validation.variants.push(
        "Please generate and configure product variants.",
      );
    } else {
      const seen = new Set<string>();

      for (const variant of product.variants) {
        const key = JSON.stringify(variant.attributes);

        if (seen.has(key)) {
          validation.variants.push(`Duplicate variant combination detected.`);
        }
        seen.add(key);

        if (variant.price <= 0) {
          validation.variants.push(`Variant price must be greater than 0.`);
        }

        if (variant.stock < 0) {
          validation.variants.push(`Variant stock cannot be negative.`);
        }
      }

      // Ensure full combination coverage
      const expectedCombos = generateCombinations(variantProps);

      if (expectedCombos.length !== product.variants.length) {
        validation.variants.push("Some variant combinations are missing.");
      }
    }

    // =====================
    // FINAL VALIDATION CHECK
    // =====================
    const hasErrors = Object.values(validation).some((arr) => arr.length > 0);

    if (hasErrors) {
      return res.status(400).send({
        message:
          "Your product cannot be submitted yet. Please fix the highlighted sections.",
        validation,
      });
    }

    // =====================
    // SUCCESS PATH
    // =====================
    product.status = "under_review";
    product.lastStage = "submitted";

    product.searchText = [
      product.title,
      product.description,
      product.brandName,
      product.categoryPath,
      ...Object.values(product.properties || {}),
      ...Object.values(product.variantProperties || {}),
    ]
      .join(" ")
      .toLowerCase();

    product.timeLine.push({
      date: new Date().toISOString(),
      description: "Product submitted for review",
      actionBy: req.cachedUser?._id || null,
    } as any);

    await product.save();

    // Invalidate cache
    const cacheKey = makeCacheKey("productDetails", { productId });
    await redis.del(cacheKey);

    return res.status(200).send({
      message: "Product submitted successfully and is now under review.",
      data: {
        productId: product.productId,
        status: product.status,
      },
    });
  } catch (error) {
    console.error("Submit product error:", error);
    return res.status(500).send({
      error: "Unable to submit product at the moment.",
    });
  }
};

// Get  Products for Authenticated Shop (Optimized)

const getAuthShopProductsController = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.cachedUser || {};
    const { page = "1", limit = "50", status } = req.query; // strings from query

    if (!shopId)
      return res
        .status(401)
        .send({ error: "Unauthorized. Shop not identified" });

    if (status && !productStatusEnums.includes(status as string)) {
      return res.status(400).send({
        error: `Invalid status filter. Allowed values: ${productStatusEnums.join(
          ", ",
        )}`,
      });
    }

    const shop = await ShopModel.findOne({ shopId }).lean();
    if (!shop) return res.status(404).send({ error: "Shop not found" });

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const params: any = { shop: shop._id, disabled: false };
    if (status) params.status = status;

    const products = await ProductModel.find(params)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select(productCardFields)
      .lean();

    const totalCount = await ProductModel.countDocuments(params);

    return res.status(200).send({
      message: "Products fetched successfully",
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Get auth shop products error:", error);
    return res.status(500).send({ error: "Unable to fetch products" });
  }
};

/**
 * Get Live Products (Public)
 * Supports: pagination, category filter, search (title, description, properties)
 * Optimized with Redis caching
 */
const getLiveProductsController = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "20",
      category_id,
      brand,
      color,
      search,
      minPrice,
      maxPrice,
      sort = "newest",
      ...otherQuery
    } = req.query;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;
    const filter: any = {
      status: "live",
      disabled: false,
    };

    // ----------------------------
    // Category Filter
    // ----------------------------
    if (category_id && typeof category_id === "string") {
      filter.category = category_id;
    }

    // ----------------------------
    // Brand Filter
    // ----------------------------
    if (brand && typeof brand === "string") {
      filter.brandSlug = brand.toLowerCase();
    }
    if (color && typeof color === "string") {
      filter["colors.value"] = color.toLowerCase();
    }

    // ----------------------------
    // Search Filter
    // ----------------------------
    if (search && typeof search === "string" && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // ----------------------------
    // Price Filter
    // ----------------------------
    if (minPrice || maxPrice) {
      filter["variants.price"] = {};
      if (minPrice) filter["variants.price"].$gte = Number(minPrice);
      if (maxPrice) filter["variants.price"].$lte = Number(maxPrice);
    }

    // ----------------------------
    // Dynamic property filters
    // ----------------------------
    // anything in query that's not one of the top-level fields is assumed to be a property filter
    const topLevelParams = [
      "page",
      "limit",
      "category_id",
      "brand",
      "search",
      "minPrice",
      "maxPrice",
      "sort",
    ];
    Object.entries(otherQuery).forEach(([key, value]) => {
      if (value && !topLevelParams.includes(key)) {
        // map directly to `properties` field
        filter[`properties.${key}`] = value;
      }
    });

    // ----------------------------
    // Sorting
    // ----------------------------
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case "price_asc":
        sortOption = { "variants.price": 1 };
        break;
      case "price_desc":
        sortOption = { "variants.price": -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }
    if (filter.$text) sortOption = { score: { $meta: "textScore" } };

    // ----------------------------
    // Cache key
    // ----------------------------
    const cacheKey = getProductQueryCacheKey("liveProducts", req.query);

    let productsData: any;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      productsData = JSON.parse(cachedData);
    } else {
      const query = ProductModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select(
          filter.$text
            ? { ...(productCardFields as any), score: { $meta: "textScore" } }
            : productCardFields,
        )
        .lean();

      const [products, totalCount] = await Promise.all([
        query,
        ProductModel.countDocuments(filter),
      ]);

      productsData = {
        products,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      };

      await redis.setEx(cacheKey, 300, JSON.stringify(productsData));
    }

    return res.status(200).send({
      message: "Live products fetched successfully",
      ...productsData,
    });
  } catch (error) {
    console.error("Get live products error:", error);
    return res.status(500).send({ error: "Unable to fetch live products" });
  }
};

// --------------------
// Get Product Details (Optimized + Redis)
// --------------------

const getProductDetailsController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { shopId, isAdmin, isSuperAdmin } = req.cachedUser || {};
    const CACHE_TTL_SECONDS = 60 * 60; // 1 hour
    if (!productId) {
      return res.status(400).send({
        error: "Product ID is required",
      });
    }

    const cacheKey = makeCacheKey("productDetails", { productId });
    const cachedData = await redis.get(cacheKey);

    if (cachedData && !shopId && !isAdmin && !isSuperAdmin) {
      return res.status(200).send({
        message: "Product details fetched (cache)",
        data: JSON.parse(cachedData),
      });
    }

    const product = await ProductModel.findOne({
      productId,
      disabled: false,
    })
      .select(
        `
        productId
        title
        description
        brandName
        brandSlug
        categoryPath
        properties
        variantProperties
        colors
        variants
        status
        hasMultipleVariants
        createdAt
        rejectionReasons
        images
        `,
      )
      .lean();

    if (!product) {
      return res.status(404).send({
        error: "Product not found",
      });
    }

    /**
     * 3️⃣ Authorization logic
     */
    const isOwner = shopId && product.shop?.toString() === shopId.toString();

    const canViewNonLive = isOwner || isAdmin || isSuperAdmin;

    if (product.status !== "live" && !canViewNonLive) {
      return res.status(403).send({
        error: "Product not available",
      });
    }

    /**
     *  Cache only LIVE public products
     */
    if (product.status === "live") {
      await redis.set(cacheKey, JSON.stringify(product), {
        EX: CACHE_TTL_SECONDS,
      });
    }

    return res.status(200).send({
      message: "Product details fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error("Get product details error:", error);
    return res.status(500).send({
      error: "Unable to fetch product details",
    });
  }
};
// --------------------
// Delete Product Image (Using deleteImageFromFirebase)
// --------------------
const deleteProductImageController = async (req: Request, res: Response) => {
  try {
    const { productId, fileName } = req.params;
    const { shopId, isAdmin, isSuperAdmin } = req.cachedUser || {};

    if (!shopId) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    if (!productId || !fileName) {
      return res.status(400).send({
        error: "productId and fileName are required",
      });
    }

    const product = await ProductModel.findOne({ productId });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (!isAdmin && !isSuperAdmin && product.shop.toString() !== shopId) {
      return res.status(403).send({
        error: "You are not allowed to modify this product",
      });
    }

    if (product.status !== "draft") {
      return res.status(400).send({
        error: "Images can only be deleted while product is in draft mode",
      });
    }

    const image = product.images?.find((img: any) => img.name === fileName);

    if (!image) {
      return res.status(404).send({
        error: "Image not found",
      });
    }

    const { thumbnail, medium, large } = image.sizes || {};

    // 🔎 Check if thumbnail is referenced in any order
    //TODO: implement order-item reference check before deletion to prevent broken images in orders
    const isUsedInOrder = false;
    // const isUsedInOrder = await ItemOrderModel.exists({
    //   image: thumbnail,
    // });

    const wasDefault = image.isDefault;

    // ----------------------------
    // 1️⃣ Remove from Mongo first
    // ----------------------------
    product.images = product.images.filter((img: any) => img.name !== fileName);

    // Maintain default invariant
    if (wasDefault && product.images.length > 0) {
      product.images[0].isDefault = true;
    }

    await product.save();

    // ----------------------------
    // 2️⃣ Delete from Firebase
    // ----------------------------

    // Always delete medium & large
    await deleteImageFromFirebase(medium);
    await deleteImageFromFirebase(large);

    // Delete thumbnail only if not referenced in order
    if (!isUsedInOrder) {
      await deleteImageFromFirebase(thumbnail);
    }

    // ----------------------------
    // 3️⃣ Invalidate Cache
    // ----------------------------
    const cacheKey = makeCacheKey("productDetails", { productId });
    await redis.del(cacheKey);

    return res.status(200).send({
      message: "Image deleted successfully",
      data: {
        remainingImages: product.images.length,
        thumbnailPreserved: !!isUsedInOrder,
        defaultReassigned: wasDefault && product.images.length > 0,
      },
    });
  } catch (error) {
    console.error("Delete product image error:", error);
    return res.status(500).send({
      error: "Unable to delete image",
    });
  }
};

const changeProductStatusController = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { status, rejectionReasons } = req.body;

    const {
      _id: user_id,
      shopId,
      isAdmin,
      isSuperAdmin,
    } = req.cachedUser || {};

    if (!user_id || !shopId) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const allowedStatuses = ["draft", "under_review", "live", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).send({
        error: "Invalid status value",
      });
    }

    const product = await ProductModel.findOne({ productId });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    const isOwner = product.shop.toString() === shopId;

    if (!isOwner && !isAdmin && !isSuperAdmin) {
      return res.status(403).send({
        error: "You are not allowed to modify this product",
      });
    }

    // Owner can only move to draft or under_review
    if (!isAdmin && !isSuperAdmin) {
      if (!["draft", "under_review"].includes(status)) {
        return res.status(403).send({
          error: "Only admins can perform this status change",
        });
      }
    }

    if (product.status === status) {
      return res.status(400).send({
        error: `Product is already ${status}`,
      });
    }

    if (status === "rejected") {
      if (!Array.isArray(rejectionReasons) || rejectionReasons.length === 0) {
        return res.status(400).send({
          error: "Rejection reasons are required",
        });
      }

      product.rejectionReasons = rejectionReasons;
    } else if (status === "live") {
      product.rejectionReasons = []; // clear previous rejections
      redis.del(MEGA_MENU_CACHE_KEY); // Invalidate mega menu cache to reflect new live product
    } else if (status === "under_review") {
      product.rejectionReasons = []; // clear previous rejections when resubmitting
    } else if (status === "draft") {
      // check if coming from live, if so invalidate mega menu cache
      if (product.status === "live") {
        redis.del(MEGA_MENU_CACHE_KEY);
      }
    }

    const previousStatus = product.status;
    product.timeLine.push({
      date: new Date().toISOString(),
      description: `Status changed from ${previousStatus} to ${status}`,
      actionBy: user_id,
      metadata: {
        from: previousStatus,
        to: status,
        rejectionReasons: status === "rejected" ? rejectionReasons : undefined,
        role: isSuperAdmin ? "super_admin" : isAdmin ? "admin" : "owner",
      },
    });

    product.status = status;

    await product.save();

    const cacheKey = makeCacheKey("productDetails", { productId });
    await redis.del(cacheKey);

    return res.status(200).send({
      message: "Product status updated successfully",
      data: {
        productId,
        previousStatus,
        currentStatus: status,
      },
    });
  } catch (error) {
    console.error("Change product status error:", error);
    return res.status(500).send({
      error: "Unable to change product status",
    });
  }
};

// --------------------
// Delete or Restore Product
// --------------------
export const toggleDeleteRestoreProductController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { productId } = req.params;
    const { action } = req.body; // "delete" | "restore"
    const {
      shopId,
      isAdmin,
      isSuperAdmin,
      _id: user_id,
    } = req.cachedUser || {};
    if (!user_id || !shopId) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    if (!productId)
      return res.status(400).send({ error: "productId is required" });
    if (!["delete", "restore"].includes(action))
      return res
        .status(400)
        .send({ error: "Action must be either 'delete' or 'restore'" });

    const product = await ProductModel.findOne({ productId });
    if (!product) return res.status(404).send({ error: "Product not found" });

    // Check permission: owners can delete/restore their own products, admins can do all
    const isOwner = product.shop.toString() === shopId;
    if (!isOwner && !isAdmin && !isSuperAdmin) {
      return res
        .status(403)
        .send({ error: "Unauthorized to modify this product" });
    }

    const newDisabledState = action === "delete";

    // Prevent redundant action
    if (product.disabled === newDisabledState) {
      return res.status(400).send({
        error: `Product is already ${newDisabledState ? "deleted" : "active"}`,
      });
    }

    // Update product
    product.disabled = newDisabledState;

    // Add timeline entry
    product.timeLine.push({
      date: new Date().toISOString(),
      description: newDisabledState
        ? "Product soft-deleted"
        : "Product restored",
      actionBy: user_id,
      metadata: { action },
    });

    await product.save();

    return res.status(200).send({
      message: `Product successfully ${newDisabledState ? "deleted" : "restored"}`,
      data: {
        product_id: product._id,
        disabled: product.disabled,
        lastStage: product.lastStage,
      },
    });
  } catch (error) {
    console.error("Toggle delete/restore product error:", error);
    return res.status(500).send({ error: "Unable to modify product status" });
  }
};
// controllers/catalog.controller.ts

const getCatalogProductsController = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "20",
      category_id,
      brand,
      color,
      ...otherQuery
    } = req.query;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Number(limit) || 100, 100);
    const skip = (pageNum - 1) * limitNum;

    // ----------------------------
    // Base filter
    // ----------------------------
    const filter: any = {
      status: "live",
      disabled: false,
    };

    if (category_id && typeof category_id === "string")
      filter.category = category_id;
    if (brand && typeof brand === "string")
      filter.brandSlug = brand.toLowerCase();
    if (color && typeof color === "string") filter["colors.value"] = color;

    // ----------------------------
    // Dynamic property filters
    // ----------------------------
    // anything in query that's not one of the top-level fields is mapped to properties
    const topLevelParams = ["page", "limit", "category_id", "brand", "color"];
    Object.entries(otherQuery).forEach(([key, value]) => {
      if (value && !topLevelParams.includes(key)) {
        filter[`properties.${key}`] = value;
      }
    });

    // ----------------------------
    // Cache key
    // ----------------------------
    const cacheKey = getProductQueryCacheKey("catalogProducts", req.query);

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).send(JSON.parse(cached));
    }

    // ----------------------------
    // Fetch products, totalCount, and filters in parallel
    // ----------------------------
    const [products, totalCount, filters] = await Promise.all([
      ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select(productCardFields)
        .lean(),

      ProductModel.countDocuments(filter),

      generateFacets(filter, category_id as string),
    ]);

    const response = {
      products,
      totalCount,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      filters,
    };

    await redis.setEx(cacheKey, 600, JSON.stringify(response));

    return res.status(200).send(response);
  } catch (err) {
    console.error("Catalog error:", err);
    return res.status(500).send({ error: "Unable to fetch catalog products" });
  }
};
/**
 * Search / catalog controller
 * Supports dynamic filters, category, pagination, and search query
 */
const searchProductsController = async (req: Request, res: Response) => {
  try {
    const { value, page = "1", limit = "20", category_id } = req.query;

    if (!value || typeof value !== "string" || !value.trim()) {
      return res.status(400).send({ error: "Search query is required" });
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const baseMatch: any = {
      status: "live",
      disabled: false,
      $text: { $search: value.trim() },
    };

    if (category_id) baseMatch.category = category_id;

    const cacheKey = getProductQueryCacheKey("searchProducts", req.query);

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).send(JSON.parse(cached));
    }

    const [products, totalCount, filters] = await Promise.all([
      ProductModel.find(baseMatch, {
        score: { $meta: "textScore" },
      })
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limitNum)
        .select(productCardFields)
        .lean(),

      ProductModel.countDocuments(baseMatch),

      generateFacets(baseMatch, category_id as string),
    ]);

    const response = {
      products,
      totalCount,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      filters,
    };

    await redis.setEx(cacheKey, 600, JSON.stringify(response));

    return res.status(200).send(response);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).send({ error: "Unable to search products" });
  }
};

const getDynamicFiltersController = async (req: Request, res: Response) => {
  try {
    const { category_id, search, brand, color } = req.query;

    // ----------------------------
    // 1️⃣ Build base match
    // ----------------------------
    const baseMatch: any = {
      status: "live",
      disabled: false,
    };

    if (category_id) baseMatch.category = category_id;

    if (search && typeof search === "string" && search.trim() !== "") {
      baseMatch.$text = { $search: search.trim() };
    }

    if (brand && typeof brand === "string") baseMatch.brandSlug = brand;
    if (color && typeof color === "string") baseMatch["colors.value"] = color;

    // ----------------------------
    // 2️⃣ Redis cache key
    // ----------------------------
    const cacheKey = getProductQueryCacheKey("dynamicFilters", req.query);

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).send(JSON.parse(cached));
    }

    // ----------------------------
    // 3️⃣ Generate facets
    // ----------------------------
    const filters = await generateFacets(baseMatch, category_id as string);

    const response = { filters };

    // ----------------------------
    // 4️⃣ Cache for 10 minutes
    // ----------------------------
    await redis.setEx(cacheKey, 600, JSON.stringify(response));

    return res.status(200).send(response);
  } catch (err) {
    console.error("Get dynamic filters error:", err);
    return res.status(500).send({
      error: "Unable to fetch dynamic filters",
    });
  }
};
export {
  getCategoryTreeForProductController,
  addEditProductBasicInfoController,
  getProductCategoryPropertiesController,
  saveProductCategoryPropertiesController,
  saveProductVariantPropertiesController,
  completeProductImagesStage,
  getProductImageUploadUrlController,
  markDefaultImageController,
  getVariantOptionsController,
  saveProductVariantsController,
  submitProductController,
  getAuthShopProductsController,
  getLiveProductsController,
  getProductDetailsController,
  getCatalogProductsController,
  searchProductsController,
  getDynamicFiltersController,
  deleteProductImageController,
  changeProductStatusController,
};
