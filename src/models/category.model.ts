import mongoose from "mongoose";
import { CategoryDocument } from "../types/category.types";


// --------------------
// Property Schema
// --------------------
const CategoryPropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    type: {
      type: String,
      required: true,
      enum: ["string", "number", "boolean", "enum"],
    },

    enumValues: { type: [String], default: [] },
    usage: {
      type: String,
      enum: ["variant", "attribute", "system"],
      default: "attribute",
    },

    required: { type: Boolean, default: false },

    filterable: { type: Boolean, default: true },

  
  },
  { _id: false }
);

// --------------------
// Category Schema
// --------------------
const CategorySchema = new mongoose.Schema<CategoryDocument>(
  {
    name: { type: String, required: true },

    slug: { type: String, required: true },

    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    parentSlug: { type: String, default: null },

    /**
     * Cached hierarchy path
     * Used for fast descendant queries & breadcrumbs
     */
    path: { type: String, required: true, index: true, unique: true },

    /**
     * Only leaf categories should have properties
     */
    properties: {
      type: [CategoryPropertySchema],
      default: [],
    },

    isActive: { type: Boolean, default: true },

    image: { type: String },
  },
  { timestamps: true }
);

// Index for hybrid path queries
CategorySchema.index({ path: 1 });


// --------------------
// Model
// --------------------
const CategoryModel = mongoose.model<CategoryDocument>(
  "Category",
  CategorySchema
);

export {
  CategoryModel,
  CategorySchema,
};
