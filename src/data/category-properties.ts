import { CategoryProperty } from "../types/category.types";
import {
  conditionEnumValues,
  babyClothSizeEnums,
  babyShoeSizeEnums,
  kidsClothSizeEnums,
  kidsShoeSizeEnums,
  colorEnums,
  patternEnums,
  materialEnums,
  accessorySizeEnums,
  hairTypeEnums,
  skinTypeEnums,
  skinConcernEnums,
  hairConcernEnums,
  productFormEnums,
  storageCapacityEnumValues,
  ramEnumValues,
  networkTypeEnumValues,
  simTypeEnumValues,
  batteryCapacityEnumValues,
  audioConnectivityEnumValues,
  noiseCancellationEnumValues,
  watchSizeEnumValues,
  watchOSEnumValues,
  chargingTypeEnumValues,
  cableLengthEnums,
  lightTypeEnums,
  wattageEnums,
  shoeSizes,
  clothSizes,
  hairMaterialEnums,
  processorEnums,
  screenSizeEnums,
  connectivityEnums,
  printerTypeEnums,
  occasionEnums,
  fitEnums,
} from "../helpers/constants";

// --------------------
// Baby & Toddler Clothing
// --------------------
export const babyClothingProps: CategoryProperty[] = [
  {
    key: "size",
    name: "Size",
    type: "enum",
    enumValues: babyClothSizeEnums,
    filterable: true,
    usage: "variant",
  },
  {
    key: "color",
    name: "Color",
    type: "enum",
    enumValues: colorEnums,
    filterable: true,
    usage: "variant",
  },
  {
    key: "material",
    name: "Material",
    type: "enum",
    enumValues: materialEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "pattern",
    name: "Pattern",
    type: "enum",
    enumValues: patternEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "condition",
    name: "Condition",
    type: "enum",
    enumValues: conditionEnumValues,
    required: true,
    filterable: true,
    usage: "system",
  },
  {
    key: "occasion",
    name: "Occasion",
    type: "enum",
    enumValues: occasionEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "fit",
    name: "Fit",
    type: "enum",
    enumValues: fitEnums,
    filterable: true,
    usage: "attribute",
  },
];

// --------------------
// Baby Shoes
// --------------------
export const babyShoeProps: CategoryProperty[] = [
  {
    key: "size",
    name: "Size",
    type: "enum",
    enumValues: babyShoeSizeEnums,
    filterable: true,
    usage: "variant",
  },
  {
    key: "color",
    name: "Color",
    type: "enum",
    enumValues: colorEnums,
    filterable: true,
    usage: "variant",
  },
  {
    key: "condition",
    name: "Condition",
    type: "enum",
    enumValues: conditionEnumValues,
    required: true,
    filterable: true,
    usage: "system",
  },
  {
    key: "occasion",
    name: "Occasion",
    type: "enum",
    enumValues: occasionEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "fit",
    name: "Fit",
    type: "enum",
    enumValues: fitEnums,
    filterable: true,
    usage: "attribute",
  },
];

// --------------------
// Kids Clothing (Boys/Girls)
// --------------------
export const kidsClothingProps: CategoryProperty[] = [
  {
    key: "size",
    name: "Size",
    type: "enum",
    enumValues: kidsClothSizeEnums,
    filterable: true,
    usage: "variant",
  },
  {
    key: "color",
    name: "Color",
    type: "enum",
    enumValues: colorEnums,
    required: true,
    filterable: true,
    usage: "variant",
  },
  {
    key: "material",
    name: "Material",
    type: "enum",
    enumValues: materialEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "pattern",
    name: "Pattern",
    type: "enum",
    enumValues: patternEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "condition",
    name: "Condition",
    type: "enum",
    enumValues: conditionEnumValues,
    required: true,
    filterable: true,
    usage: "system",
  },
  {
    key: "occasion",
    name: "Occasion",
    type: "enum",
    enumValues: occasionEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "fit",
    name: "Fit",
    type: "enum",
    enumValues: fitEnums,
    filterable: true,
    usage: "attribute",
  },
];

// --------------------
// Kids Shoes (Boys/Girls)
// --------------------
export const kidsShoeProps: CategoryProperty[] = [
  {
    key: "size",
    name: "Size",
    type: "enum",
    enumValues: kidsShoeSizeEnums,
    filterable: true,
    usage: "variant",
  },
  {
    key: "color",
    name: "Color",
    type: "enum",
    enumValues: colorEnums,
    filterable: true,
    usage: "variant",
    required: true,
  },
  {
    key: "condition",
    name: "Condition",
    type: "enum",
    enumValues: conditionEnumValues,
    required: true,
    filterable: true,
    usage: "system",
  },
  {
    key: "occasion",
    name: "Occasion",
    type: "enum",
    enumValues: occasionEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "fit",
    name: "Fit",
    type: "enum",
    enumValues: fitEnums,
    filterable: true,
    usage: "attribute",
  },
];

// --------------------
// Accessories
// --------------------
export const accessoryProps: CategoryProperty[] = [
  {
    key: "size",
    name: "Size",
    type: "enum",
    enumValues: accessorySizeEnums,
    filterable: true,
    usage: "variant",
  },
  {
    key: "color",
    name: "Color",
    type: "enum",
    enumValues: colorEnums,
    filterable: true,
    usage: "variant",
    required: true,
  },
  {
    key: "material",
    name: "Material",
    type: "enum",
    enumValues: materialEnums,
    filterable: true,
    usage: "attribute",
  },
  {
    key: "condition",
    name: "Condition",
    type: "enum",
    enumValues: conditionEnumValues,
    filterable: true,
    required: true,
    usage: "system",
  },
];

// --------------------
// Utilities / Misc (Feeding, Toys, etc.)
// --------------------
export const utilityProps: CategoryProperty[] = [
  {
    key: "condition",
    name: "Condition",
    type: "enum",
    enumValues: conditionEnumValues,
    filterable: true,
    usage: "system",
  },
];

/**
 * Only allow "New_with_tags" for beauty
 */
const beautyConditionEnums = conditionEnumValues.filter(
  (v) => v === "New_with_tags",
);

/* =========================
   SYSTEM (ALL BEAUTY LEAVES)
========================= */
export const beautyConditionProperty: CategoryProperty = {
  key: "condition",
  name: "Condition",
  type: "enum",
  enumValues: beautyConditionEnums,
  required: true,
  filterable: true,
  usage: "system",
};

/* =========================
   SKIN PROPERTIES
========================= */
export const skinTypeProperty: CategoryProperty = {
  key: "skin_type",
  name: "Skin Type",
  type: "enum",
  enumValues: skinTypeEnums,
  filterable: true,
  usage: "attribute",
};

export const skinConcernProperty: CategoryProperty = {
  key: "skin_concern",
  name: "Skin Concern",
  type: "enum",
  enumValues: skinConcernEnums,
  filterable: true,
  usage: "attribute",
};

/* =========================
   HAIR PROPERTIES
========================= */
export const hairTypeProperty: CategoryProperty = {
  key: "hair_type",
  name: "Hair Type",
  type: "enum",
  enumValues: hairTypeEnums,
  filterable: true,
  usage: "attribute",
};

export const hairConcernProperty: CategoryProperty = {
  key: "hair_concern",
  name: "Hair Concern",
  type: "enum",
  enumValues: hairConcernEnums,
  filterable: true,
  usage: "attribute",
};

/* =========================
   PRODUCT FORM
========================= */
export const productFormProperty: CategoryProperty = {
  key: "product_form",
  name: "Product Form",
  type: "enum",
  enumValues: productFormEnums,
  filterable: true,
  usage: "attribute",
};

export const conditionProperty: CategoryProperty = {
  key: "condition",
  name: "Condition",
  type: "enum",
  enumValues: conditionEnumValues,
  filterable: true,
  required: true,
  usage: "system",
};
export const wattageProperty: CategoryProperty = {
  key: "wattage",
  name: "Wattage",
  type: "enum",
  enumValues: wattageEnums,
  required: false,
  filterable: true,
  usage: "attribute",
};

export const cableLengthProperty: CategoryProperty = {
  key: "cableLength",
  name: "Cable Length",
  type: "enum",
  enumValues: cableLengthEnums,
  required: false,
  filterable: true,
  usage: "attribute",
};
export const lightTypeProperty: CategoryProperty = {
  key: "lightType",
  name: "Light Type",
  type: "enum",
  enumValues: lightTypeEnums,
  required: false,
  filterable: true,
  usage: "attribute",
};

export const colorProperty: CategoryProperty = {
  key: "color",
  name: "Color",
  type: "enum",
  enumValues: colorEnums,
  required: true,
  filterable: true,
  usage: "variant",
};
export const chargingTypeProperty: CategoryProperty = {
  key: "chargingType",
  name: "Charging Type",
  type: "enum",
  enumValues: chargingTypeEnumValues,
  required: false,
  filterable: true,
  usage: "attribute",
};

export const storageCapacityProperty: CategoryProperty = {
  key: "storageCapacity",
  name: "Storage Capacity",
  type: "enum",
  enumValues: storageCapacityEnumValues,
  required: true,
  filterable: true,
  usage: "variant",
};
export const ramProperty: CategoryProperty = {
  key: "ram",
  name: "RAM",
  type: "enum",
  enumValues: ramEnumValues,
  required: false,
  filterable: true,
  usage: "variant",
};

export const networkTypeProperty: CategoryProperty = {
  key: "networkType",
  name: "Network Type",
  type: "enum",
  enumValues: networkTypeEnumValues,
  required: false,
  filterable: true,
  usage: "attribute",
};

export const simTypeProperty: CategoryProperty = {
  key: "simType",
  name: "SIM Type",
  type: "enum",
  enumValues: simTypeEnumValues,
  required: true,
  filterable: true,
  usage: "attribute",
};
export const batteryCapacityProperty: CategoryProperty = {
  key: "batteryCapacity",
  name: "Battery Capacity",
  type: "enum",
  enumValues: batteryCapacityEnumValues,
  required: false,
  filterable: true,
  usage: "attribute",
};
export const audioConnectivityProperty: CategoryProperty = {
  key: "audioConnectivity",
  name: "Audio Connectivity",
  type: "enum",
  enumValues: audioConnectivityEnumValues,
  required: false,
  filterable: true,
  usage: "attribute",
};

export const noiseCancellationProperty: CategoryProperty = {
  key: "noiseCancellation",
  name: "Noise Cancellation",
  type: "enum",
  enumValues: noiseCancellationEnumValues,
  required: false,
  filterable: true,
  usage: "attribute",
};

export const watchSizeProperty: CategoryProperty = {
  key: "watchSize",
  name: "Watch Size",
  type: "enum",
  enumValues: watchSizeEnumValues,
  required: false,
  filterable: true,
  usage: "variant",
};

export const watchOSProperty: CategoryProperty = {
  key: "watchOS",
  name: "Watch Operating System",
  type: "enum",
  enumValues: watchOSEnumValues,
  required: false,
  filterable: true,
  usage: "attribute",
};

export const clothSizeProperty: CategoryProperty = {
  key: "cloth_size",
  name: "Cloth Size",
  type: "enum",
  enumValues: clothSizes,
  filterable: true,
  usage: "variant",
};

export const shoeSizeProperty: CategoryProperty = {
  key: "shoe_size",
  name: "Shoe Size",
  type: "enum",
  enumValues: shoeSizes,
  filterable: true,
  usage: "variant",
};

export const materialProperty: CategoryProperty = {
  key: "material",
  name: "Material",
  type: "enum",
  enumValues: materialEnums,
  filterable: true,
  usage: "attribute",
};

export const patternProperty: CategoryProperty = {
  key: "pattern",
  name: "Pattern",
  type: "enum",
  enumValues: patternEnums,
  filterable: true,
  usage: "attribute",
};
export const occasionProperty: CategoryProperty = {
  key: "occasion",
  name: "Occasion",
  type: "enum",
  enumValues: occasionEnums,
  filterable: true,
  usage: "attribute",
};

export const accessorySizeProperty: CategoryProperty = {
  key: "accessory_size",
  name: "Accessory Size",
  type: "enum",
  enumValues: accessorySizeEnums,
  filterable: true,
  usage: "variant",
};
export const fitProperty: CategoryProperty = {
  key: "fit",
  name: "Fit",
  type: "enum",
  enumValues: fitEnums,
  filterable: true,
  usage: "attribute",
};

/* =========================
   SYSTEM (ALL BEAUTY LEAVES)
========================= */
export const hairConditionProperty: CategoryProperty = {
  key: "condition",
  name: "Condition",
  type: "enum",
  enumValues: beautyConditionEnums,
  required: true,
  filterable: true,
  usage: "system",
};

export const hairMaterialProperty: CategoryProperty = {
  key: "hairMaterial",
  name: "Hair Material",
  type: "enum",
  enumValues: hairMaterialEnums,
  required: false,
  filterable: true,
  usage: "attribute",
};
export const printerTypeProperty: CategoryProperty = {
  key: "printerType",
  name: "Printer Type",
  type: "enum",
  enumValues: printerTypeEnums,
  filterable: true,
  usage: "attribute",
};
export const processorProperty: CategoryProperty = {
  key: "processor",
  name: "Processor",
  type: "enum",
  enumValues: processorEnums,
  required: true,
  filterable: true,
  usage: "attribute",
};
export const screenSizeProperty: CategoryProperty = {
  key: "screenSize",
  name: "Screen Size",
  type: "enum",
  enumValues: screenSizeEnums,
  required: true,
  filterable: true,
  usage: "variant",
};
export const connectivityProperty: CategoryProperty = {
  key: "connectivity",
  name: "Connectivity",
  type: "enum",
  enumValues: connectivityEnums,
  required: false,
  filterable: true,
  usage: "attribute",
};
