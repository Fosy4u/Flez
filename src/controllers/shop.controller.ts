import { Request, Response } from "express";
import { ShopModel } from "../models/shop.model";
import { UserModel } from "../models/user.model";



/**
 * Create shop for logged-in user (idempotent)
 */
const createMyShop = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.cachedUser || {};
    if (!userId) return res.status(401).send({ error: "Unauthorized" });

    const existingShop = await ShopModel.findOne({ owner: userId });
    if (existingShop)
      return res.status(200).send({
        data: existingShop,
        message: "Shop already exists",
      });

    const { name, description, legalName } = req.body;
    if (!name)
      return res.status(400).send({ error: "Shop name is required" });

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const shop = await ShopModel.create({
      owner: userId,
      name,
      slug,
      description,
      legalName,
      status: "active",
    });

    // Update user model with shopId
    await UserModel.findByIdAndUpdate(userId, { shopId: shop.shopId });

    return res.status(201).send({
      data: shop,
      message: "Shop created successfully",
    });
  } catch (error) {
    console.error("Create shop error:", error);
    return res.status(500).send({ error: "Unable to create shop" });
  }
};

/**
 * Get logged-in user's shop
 */
const getMyShop = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.cachedUser || {};
    if (!userId) return res.status(401).send({ error: "Unauthorized" });

    const shop = await ShopModel.findOne({ owner: userId });
    if (!shop) return res.status(404).send({ error: "Shop not found" });

    return res.status(200).send({
      data: shop,
      message: "Shop fetched successfully",
    });
  } catch (error) {
    console.error("Get shop error:", error);
    return res.status(500).send({ error: "Unable to fetch shop" });
  }
};

/**
 * Update logged-in user's shop
 */
const updateMyShop = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.cachedUser || {};
    if (!userId) return res.status(401).send({ error: "Unauthorized" });

    const shop = await ShopModel.findOne({ owner: userId });
    if (!shop) return res.status(404).send({ error: "Shop not found" });

    const allowedUpdates = [
      "name",
      "description",
      "legalName",
      "logo",
      "banner",
      "address",
      "contactInfo",
      "bankDetails",
    ];

    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) (shop as any)[key] = req.body[key];
    });

    await shop.save();

    return res.status(200).send({
      data: shop,
      message: "Shop updated successfully",
    });
  } catch (error) {
    console.error("Update shop error:", error);
    return res.status(500).send({ error: "Unable to update shop" });
  }
};

/**
 * Admin endpoint: update shop status using shopId
 */
const adminUpdateShopStatus = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { status } = req.body;

    if (!["pending", "active", "suspended", "rejected"].includes(status))
      return res.status(400).send({ error: "Invalid status value" });

    const shop = await ShopModel.findOne({ shopId });
    if (!shop) return res.status(404).send({ error: "Shop not found" });

    shop.status = status;
    await shop.save();

    return res.status(200).send({
      data: shop,
      message: "Shop status updated successfully",
    });
  } catch (error) {
    console.error("Admin update shop status error:", error);
    return res.status(500).send({ error: "Unable to update shop status" });
  }
};

/**
 * Admin endpoint: get all shops, optional status filter
 */
const getAllShops = async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };

    const filter: any = {};
    if (status) filter.status = status;

    const shops = await ShopModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).send({
      data: shops,
      message: "Shops fetched successfully",
    });
  } catch (error) {
    console.error("Get all shops error:", error);
    return res.status(500).send({ error: "Unable to fetch shops" });
  }
};

/**
 * Admin endpoint: get shop by shopId
 */
const getShopByShopId = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;

    const shop = await ShopModel.findOne({ shopId });
    if (!shop) return res.status(404).send({ error: "Shop not found" });

    return res.status(200).send({
      data: shop,
      message: "Shop fetched successfully",
    });
  } catch (error) {
    console.error("Get shop by shopId error:", error);
    return res.status(500).send({ error: "Unable to fetch shop" });
  }
};

// ---------------- Export all at bottom ----------------
export {
  createMyShop,
  getMyShop,
  updateMyShop,
  adminUpdateShopStatus,
  getAllShops,
  getShopByShopId,
};

