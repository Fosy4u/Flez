import { Types } from "mongoose";
// --------------------
// Property Types
// --------------------
 type PropertyType = "string" | "number" | "boolean" | "enum";

 interface PropertyOption {
  label: string;
  value: string;
  description?: string;
  hex?: string; // for colors
  background?: string; // for multicolor gradient if needed
}

 interface PropertyTemplate {
  name: string;
  type: PropertyType;
  enumValues?: PropertyOption[]; // for enums
  required?: boolean;
  filterable?: boolean;
  order?: number;
}

type CategoryPropertyType = "string" | "number" | "boolean" | "enum";

interface CategoryProperty {
  key: string;                  // e.g. "ram", "style"
  name: string;                 // e.g. "RAM", "Style"
  type: CategoryPropertyType;
  enumValues?: string[];        // only if type === "enum"
  required?: boolean;
  filterable?: boolean;
  order?: number;
  usage: "variant" | "attribute" | "system"; // variant: controls varions, attribute: info only, system: compulsory for all products like a condition property
}

interface CategoryDocument {

  name: string;
  slug: string;


  parent_id?: Types.ObjectId | null;
  parentSlug?: string | null;

  /**
   * Hybrid path
   * Example: computer-accessories/laptop/gaming-laptop
   */
  path: string;

  /**
   * Only populated for leaf categories
   */
  properties?: CategoryProperty[];

  isActive: boolean;

  /**
   * Optional image/icon for UI
   */

  image?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type {
  CategoryProperty,
  CategoryPropertyType,
  CategoryDocument,
  PropertyOption,
  PropertyTemplate,
};
