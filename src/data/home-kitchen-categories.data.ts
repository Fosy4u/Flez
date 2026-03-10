import { conditionProperty,
            colorProperty,
            wattageProperty
 } from "./category-properties";

export const homeKitchenCategories = [
  // ROOT
  {
    name: "Home & Kitchen Appliances",
    slug: "home-kitchen-appliances",
    path: "home-kitchen-appliances",
    parentSlug: null,
    parent_id: null,
    properties: [],
    isActive: true,
  },

  // ---------------- PARENTS ----------------
  {
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    path: "home-kitchen-appliances/kitchen-appliances",
    parentSlug: "home-kitchen-appliances",
    parent_id: null,
    properties: [],
    isActive: true,
  },
  {
    name: "Home Electricals",
    slug: "home-electricals",
    path: "home-kitchen-appliances/home-electricals",
    parentSlug: "home-kitchen-appliances",
    parent_id: null,
    properties: [],
    isActive: true,
  },
  {
    name: "Cookerware & Kitchen Items",
    slug: "cookware-kitchen-items",
    path: "home-kitchen-appliances/cookware-kitchen-items",
    parentSlug: "home-kitchen-appliances",
    parent_id: null,
    properties: [],
    isActive: true,
  },

  // ---------------- KITCHEN APPLIANCES ----------------
  { name:"Blender",slug:"blender",path:"home-kitchen-appliances/kitchen-appliances/blender",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Electric Kettle",slug:"electric-kettle",path:"home-kitchen-appliances/kitchen-appliances/electric-kettle",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Toaster",slug:"toaster",path:"home-kitchen-appliances/kitchen-appliances/toaster",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Sandwich Maker",slug:"sandwich-maker",path:"home-kitchen-appliances/kitchen-appliances/sandwich-maker",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Air Fryer",slug:"air-fryer",path:"home-kitchen-appliances/kitchen-appliances/air-fryer",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Rice Cooker (table-size only)",slug:"rice-cooker",path:"home-kitchen-appliances/kitchen-appliances/rice-cooker",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Coffee Maker",slug:"coffee-maker",path:"home-kitchen-appliances/kitchen-appliances/coffee-maker",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Hand Mixer",slug:"hand-mixer",path:"home-kitchen-appliances/kitchen-appliances/hand-mixer",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Juicer",slug:"juicer",path:"home-kitchen-appliances/kitchen-appliances/juicer",parentSlug:"kitchen-appliances",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },

  // ---------------- HOME ELECTRICALS ----------------
  { name:"Electric Iron",slug:"electric-iron",path:"home-kitchen-appliances/home-electricals/electric-iron",parentSlug:"home-electricals",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Garment Steamer",slug:"garment-steamer",path:"home-kitchen-appliances/home-electricals/garment-steamer",parentSlug:"home-electricals",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Extension Box",slug:"extension-box",path:"home-kitchen-appliances/home-electricals/extension-box",parentSlug:"home-electricals",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Rechargeable Lamp",slug:"rechargeable-lamp",path:"home-kitchen-appliances/home-electricals/rechargeable-lamp",parentSlug:"home-electricals",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Night Lamp",slug:"night-lamp",path:"home-kitchen-appliances/home-electricals/night-lamp",parentSlug:"home-electricals",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Desk Fan",slug:"desk-fan",path:"home-kitchen-appliances/home-electricals/desk-fan",parentSlug:"home-electricals",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },
  { name:"Mosquito Killer Bat",slug:"mosquito-killer-bat",path:"home-kitchen-appliances/home-electricals/mosquito-killer-bat",parentSlug:"home-electricals",parent_id:null,properties:[conditionProperty,colorProperty,wattageProperty],isActive:true },

  // ---------------- COOKWARE ----------------
  { name:"Pots",slug:"pots",path:"home-kitchen-appliances/cookware-kitchen-items/pots",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Pans",slug:"pans",path:"home-kitchen-appliances/cookware-kitchen-items/pans",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Plates",slug:"plates",path:"home-kitchen-appliances/cookware-kitchen-items/plates",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Bowls",slug:"bowls",path:"home-kitchen-appliances/cookware-kitchen-items/bowls",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Cups & Mugs",slug:"cups-mugs",path:"home-kitchen-appliances/cookware-kitchen-items/cups-mugs",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Cutlery",slug:"cutlery",path:"home-kitchen-appliances/cookware-kitchen-items/cutlery",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Cooking Utensils",slug:"cooking-utensils",path:"home-kitchen-appliances/cookware-kitchen-items/cooking-utensils",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Food Containers",slug:"food-containers",path:"home-kitchen-appliances/cookware-kitchen-items/food-containers",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
  { name:"Knives",slug:"knives",path:"home-kitchen-appliances/cookware-kitchen-items/knives",parentSlug:"cookware-kitchen-items",parent_id:null,properties:[conditionProperty,colorProperty],isActive:true },
];
