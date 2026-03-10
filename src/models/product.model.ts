// models/product.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>; // e.g., { size: "M", color: "Red" }
}
export interface ProductImageSizes {
  thumbnail: string; // 200px
  medium: string; // 600px
  large: string; // 1200px
}

export interface ProductImage {
  name: string;
  sizes: ProductImageSizes;
  isDefault?: boolean;
  attributes: {
    color: string;
  };
}
export interface ProductColor {
  value: string; // e.g., "Red"
  hex: string; // e.g., "#FF0000" (optional, can be computed from value if needed)
  background: string; // e.g., ""radial-gradient(circle, hsla(41, 83%, 70%, 1) 23%, hsla(321, 90%, 70%, 1) 100%)" (also optional, can be computed or assigned a default)
}

export type ProductStage =
  | "basicInfo" // title, description
  | "categoryProperties" // non-variant attributes
  | "variantProperties" // select variant attributes
  | "productImages" // assign images per color
  | "variants" // SKU, price, stock combinations
  | "submitted"; // final submission for review

export interface ProductDocument extends Document {
  name: string;
  title: string;
  productId: string; // custom unique product ID for public reference (not MongoDB _id)
  description: string;
  searchText: string; // for text index
  brandName: string; // snapshot
  brandSlug: string; // canonical slug
  shop: mongoose.Types.ObjectId;
  status: "draft" | "under_review" | "live" | "rejected";
  disabled: boolean;
  hasMultipleVariants: boolean;
  lastStage: ProductStage;
  category: mongoose.Types.ObjectId; // link only to leaf category
  categoryPath: string; // cached path
  properties: Record<string, any>; // all category properties
  variantProperties: Record<string, string[]>; // selected variant property options
  colors: ProductColor[];
  images: ProductImage[]; // all images with color association
  variants: ProductVariant[];
  timeLine: {
    date: string;
    description: string;
    actionBy: mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
  }[];
  rejectionReasons: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema: Schema<ProductDocument> = new Schema(
  {
    title: { type: String, required: true },
    productId: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    searchText: { type: String, default: "" }, // for text index
    brandName: { type: String, required: true },
    brandSlug: { type: String, required: true },

    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "under_review", "live", "rejected"],
      default: "draft",
    },

    disabled: { type: Boolean, default: false },
    hasMultipleVariants: { type: Boolean, default: false },

    lastStage: {
      type: String,
      enum: [
        "basicInfo",
        "categoryProperties",
        "variantProperties",
        "productImages",
        "variants",
      ],
      default: "basicInfo",
    },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryPath: { type: String, required: true },

    properties: {
      type: Map,
      of: { type: [String], set: (v: any) => (Array.isArray(v) ? v : [v]) },
      default: {},
    }, // non-variant attributes
    variantProperties: {
      type: Map,
      of: { type: [String], set: (v: any) => (Array.isArray(v) ? v : [v]) },
      default: {},
    }, // selected variant options

    colors: [
      {
        value: { type: String, required: true },
        hasUploadedImage: { type: Boolean, default: false },
      },
    ],

    images: [
      {
        name: { type: String, required: true },
        sizes: {
          thumbnail: { type: String, required: true },
          medium: { type: String, required: true },
          large: { type: String, required: true },
        },
        isDefault: { type: Boolean, default: false },
        attributes: {
          color: { type: String, required: true },
        },
      },
    ],

    variants: [
      {
        sku: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        attributes: { type: Schema.Types.Mixed, required: true }, // e.g., { color: "Red", size: "M" }
      },
    ],

    timeLine: [
      {
        date: { type: String, required: true },
        description: { type: String, required: true },
        actionBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
        metadata: { type: Schema.Types.Mixed, default: {} },
      },
    ],

    rejectionReasons: [{ type: String, required: true }],
  },
  { timestamps: true },
);
ProductSchema.index({ searchText: "text" });
ProductSchema.index({ status: 1, disabled: 1 });

export const ProductModel: Model<ProductDocument> =
  mongoose.model<ProductDocument>("Product", ProductSchema);
