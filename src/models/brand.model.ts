// models/brand.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { IBrand, BrandType } from "../types/brand.types";
import slugify from "slugify";

export interface BrandDocument extends IBrand, Document {}

const BrandSchema: Schema<BrandDocument> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: ["official", "custom", "generic"], required: true },
    departments: [{ type: String, required: true }],
    isApproved: { type: Boolean, default: false },
    isFilterable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug if not provided or name changed
BrandSchema.pre<BrandDocument>("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const BrandModel: Model<BrandDocument> = mongoose.model<BrandDocument>(
  "Brand",
  BrandSchema
);
