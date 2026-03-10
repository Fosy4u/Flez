import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import { ShopDocument } from "../types/shop.types";

const bankDetailsSchema = new Schema(
  {
    bankName: String,
    accountName: String,
    accountNumber: String,
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    country: { type: String, required: true },
    state: String,
    city: String,
    street: String,
    postalCode: String,
  },
  { _id: false }
);

const contactInfoSchema = new Schema(
  {
    supportEmail: String,
    supportPhone: String,
  },
  { _id: false }
);

// helper to generate random shopId
const generateShopId = () => {
  return `SHOP_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

const shopSchema = new Schema<ShopDocument>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    shopId: { type: String, required: true, unique: true, default: generateShopId },

    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: String,
    legalName: String,

    logo: String,
    banner: String,

    address: addressSchema,
    contactInfo: contactInfoSchema,
    bankDetails: bankDetailsSchema,

    isVerified: { type: Boolean, default: false },

    status: { type: String, enum: ["pending", "active", "suspended", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

export const ShopModel = mongoose.model<ShopDocument>("Shop", shopSchema);
