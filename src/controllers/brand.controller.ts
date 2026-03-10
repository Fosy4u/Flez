// controllers/brand.controller.ts
import { Request, Response } from "express";
import { BrandModel } from "../models/brand.model";
import { invalidateBrandCache, getCachedBrands } from "../cache/brand.cache";
import { ProductModel } from "../models/product.model"; // for snapshot propagation
import { mapBrandForFrontend } from "../helpers/brand.helper";



// -------------------- Controllers --------------------

// Get all brands (admin or filter)
const getAllBrands = async (req: Request, res: Response) => {
  try {
    const brands = await getCachedBrands();
    const mappedBrands = brands.map(mapBrandForFrontend);
    return res.status(200).send({
      message: "Brands fetched successfully",
      data: mappedBrands,
    });
  } catch (error) {
    console.error("Get brands error:", error);
    return res.status(500).send({ error: "Unable to fetch brands" });
  }
};

// Approve a custom brand (admin only)
const approveBrand = async (req: Request, res: Response) => {
  try {
    const { brand_id } = req.params;
    const brand = await BrandModel.findByIdAndUpdate(
      brand_id,
      { isApproved: true },
      { new: true }
    ).lean();

    if (!brand) return res.status(404).send({ error: "Brand not found" });

    invalidateBrandCache();

    return res.status(200).send({
      message: "Brand approved",
      data: mapBrandForFrontend(brand),
    });
  } catch (error) {
    console.error("Approve brand error:", error);
    return res.status(500).send({ error: "Unable to approve brand" });
  }
};

// Toggle filterable (admin only)
const toggleBrandFilterable = async (req: Request, res: Response) => {
  try {
    const { brand_id } = req.params;
    const { isFilterable } = req.body;

    if (typeof isFilterable !== "boolean") {
      return res.status(400).send({ error: "isFilterable must be boolean" });
    }

    const brand = await BrandModel.findByIdAndUpdate(
      brand_id,
      { isFilterable },
      { new: true }
    ).lean();

    if (!brand) return res.status(404).send({ error: "Brand not found" });

    invalidateBrandCache();

    return res.status(200).send({
      message: "Brand updated",
      data: mapBrandForFrontend(brand),
    });
  } catch (error) {
    console.error("Toggle filterable error:", error);
    return res.status(500).send({ error: "Unable to update brand" });
  }
};

// Update brand name + optionally propagate snapshots (admin only)
const updateBrandName = async (req: Request, res: Response) => {
  try {
    const { brand_id } = req.params;
    const { name, propagateSnapshots } = req.body;

    if (!name || !propagateSnapshots) {
      return res.status(400).send({
        error: "Both 'name' and 'propagateSnapshots' are required",
      });
    }

    if (!["yes", "no"].includes(propagateSnapshots)) {
      return res.status(400).send({
        error: "'propagateSnapshots' must be 'yes' or 'no'",
      });
    }

    const brand = await BrandModel.findById(brand_id);
    if (!brand) return res.status(404).send({ error: "Brand not found" });

    const oldSlug = brand.slug;
    brand.name = name;
    brand.slug = require("slugify")(name, { lower: true, strict: true });
    await brand.save();

    if (propagateSnapshots === "yes") {
      await ProductModel.updateMany(
        { brandSlug: oldSlug },
        { $set: { brandName: name, brandSlug: brand.slug } }
      );
    }

    invalidateBrandCache();

    return res.status(200).send({
      message: "Brand updated",
      data: mapBrandForFrontend(brand),
    });
  } catch (error) {
    console.error("Update brand name error:", error);
    return res.status(500).send({ error: "Unable to update brand" });
  }
};

// Disable brand (admin only)
const disableBrand = async (req: Request, res: Response) => {
  try {
    const { brand_id } = req.params;
    const brand = await BrandModel.findByIdAndUpdate(
      brand_id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!brand) return res.status(404).send({ error: "Brand not found" });

    invalidateBrandCache();

    return res.status(200).send({
      message: "Brand disabled",
      data: mapBrandForFrontend(brand),
    });
  } catch (error) {
    console.error("Disable brand error:", error);
    return res.status(500).send({ error: "Unable to disable brand" });
  }
};

// Delete custom brand (admin only)
const deleteCustomBrand = async (req: Request, res: Response) => {
  try {
    const { brand_id } = req.params;
    const brand = await BrandModel.findById(brand_id);

    if (!brand) return res.status(404).send({ error: "Brand not found" });
    if (brand.type !== "custom") {
      return res
        .status(403)
        .send({ error: "Cannot delete official brand" });
    }

    const hasProducts = await ProductModel.exists({ brandSlug: brand.slug });
    if (hasProducts) {
      return res
        .status(400)
        .send({ error: "Cannot delete brand with existing products" });
    }

    await brand.deleteOne();
    invalidateBrandCache();

    return res.status(200).send({ message: "Brand deleted" });
  } catch (error) {
    console.error("Delete brand error:", error);
    return res.status(500).send({ error: "Unable to delete brand" });
  }
};

// -------------------- Exports --------------------
export {
  getAllBrands,
  approveBrand,
  toggleBrandFilterable,
  updateBrandName,
  disableBrand,
  deleteCustomBrand,
};
