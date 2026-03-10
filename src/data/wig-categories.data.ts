import { colorProperty, hairConditionProperty, hairMaterialProperty, hairTypeProperty,
    hairConcernProperty, productFormProperty

 } from "./category-properties";



export const wigEextensionAndHairCareCategories = [
    {
  name: "Wigs, Extensions & Haircare",
  slug: "wigs-extensions-haircare",
  path: "wigs-extensions-haircare",
  parentSlug: null,
  parent_id: null,
  isActive: true
},
{
  name: "Wigs",
  slug: "wigs",
  path: "wigs-extensions-haircare/wigs",
  parentSlug: "wigs-extensions-haircare",
  parent_id: null,
  isActive: true
},
{
  name: "Hair Extensions",
  slug: "hair-extensions",
  path: "wigs-extensions-haircare/hair-extensions",
  parentSlug: "wigs-extensions-haircare",
  parent_id: null,
  isActive: true
},
{
  name: "Haircare",
  slug: "haircare",
  path: "wigs-extensions-haircare/haircare",
  parentSlug: "wigs-extensions-haircare",
  parent_id: null,
  isActive: true
},
{
  name: "Hair Tools & Accessories",
  slug: "hair-tools-accessories",
  path: "wigs-extensions-haircare/hair-tools-accessories",
  parentSlug: "wigs-extensions-haircare",
  parent_id: null,
  isActive: true
},
{
  name: "Human Hair Wigs",
  slug: "human-hair-wigs",
  path: "wigs-extensions-haircare/wigs/human-hair-wigs",
  parentSlug: "wigs",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairTypeProperty,
    hairMaterialProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Synthetic Hair Wigs",
  slug: "synthetic-hair-wigs",
  path: "wigs-extensions-haircare/wigs/synthetic-hair-wigs",
  parentSlug: "wigs",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairTypeProperty,
    hairMaterialProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Human Hair Bundles",
  slug: "human-hair-bundles",
  path: "wigs-extensions-haircare/hair-extensions/human-hair-bundles",
  parentSlug: "hair-extensions",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairTypeProperty,
    hairMaterialProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Braids Extensions",
  slug: "braids-extensions",
  path: "wigs-extensions-haircare/hair-extensions/braids-extensions",
  parentSlug: "hair-extensions",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairTypeProperty,
    hairMaterialProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Tape-ins & Clip-ins",
  slug: "tape-ins-clip-ins",
  path: "wigs-extensions-haircare/hair-extensions/tape-ins-clip-ins",
  parentSlug: "hair-extensions",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairTypeProperty,
    hairMaterialProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Extension Tools & Accessories",
  slug: "extension-tools-accessories",
  path: "wigs-extensions-haircare/hair-extensions/extension-tools-accessories",
  parentSlug: "hair-extensions",
  parent_id: null,
  properties: [
    hairConditionProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Men's Haircare",
  slug: "mens-haircare",
  path: "wigs-extensions-haircare/haircare/mens-haircare",
  parentSlug: "haircare",
  parent_id: null,
  isActive: true
},
{
  name: "Shampoo & Conditioner",
  slug: "shampoo-conditioner",
  path: "wigs-extensions-haircare/haircare/shampoo-conditioner",
  parentSlug: "haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Hair Treatments & Oils",
  slug: "hair-treatments-oils",
  path: "wigs-extensions-haircare/haircare/hair-treatments-oils",
  parentSlug: "haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Hair Colour & Dye",
  slug: "hair-colour-dye",
  path: "wigs-extensions-haircare/haircare/hair-colour-dye",
  parentSlug: "haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    productFormProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Styling Products (Gel, Wax, Edge control)",
  slug: "styling-products",
  path: "wigs-extensions-haircare/haircare/styling-products",
  parentSlug: "haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Heat Protection",
  slug: "heat-protection",
  path: "wigs-extensions-haircare/haircare/heat-protection",
  parentSlug: "haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Other Haircare",
  slug: "other-haircare",
  path: "wigs-extensions-haircare/haircare/other-haircare",
  parentSlug: "haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Wave Cream",
  slug: "wave-cream",
  path: "wigs-extensions-haircare/haircare/mens-haircare/wave-cream",
  parentSlug: "mens-haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Beard Oil",
  slug: "beard-oil",
  path: "wigs-extensions-haircare/haircare/mens-haircare/beard-oil",
  parentSlug: "mens-haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Beard Shampoo",
  slug: "beard-shampoo",
  path: "wigs-extensions-haircare/haircare/mens-haircare/beard-shampoo",
  parentSlug: "mens-haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Beard Balm",
  slug: "beard-balm",
  path: "wigs-extensions-haircare/haircare/mens-haircare/beard-balm",
  parentSlug: "mens-haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Beard Conditioner",
  slug: "beard-conditioner",
  path: "wigs-extensions-haircare/haircare/mens-haircare/beard-conditioner",
  parentSlug: "mens-haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Beard Growth Serum",
  slug: "beard-growth-serum",
  path: "wigs-extensions-haircare/haircare/mens-haircare/beard-growth-serum",
  parentSlug: "mens-haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Other Men's Haircare",
  slug: "other-mens-haircare",
  path: "wigs-extensions-haircare/haircare/mens-haircare/other-mens-haircare",
  parentSlug: "mens-haircare",
  parent_id: null,
  properties: [
    hairConditionProperty,
    hairConcernProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Hair Dryers",
  slug: "hair-dryers",
  path: "wigs-extensions-haircare/hair-tools-accessories/hair-dryers",
  parentSlug: "hair-tools-accessories",
  parent_id: null,
  properties: [
    hairConditionProperty
  ],
  isActive: true
},
{
  name: "Hair Straighteners & Curlers",
  slug: "hair-straighteners-curlers",
  path: "wigs-extensions-haircare/hair-tools-accessories/hair-straighteners-curlers",
  parentSlug: "hair-tools-accessories",
  parent_id: null,
  properties: [
    hairConditionProperty
  ],
  isActive: true
},
{
  name: "Comb & Brushes",
  slug: "comb-brushes",
  path: "wigs-extensions-haircare/hair-tools-accessories/comb-brushes",
  parentSlug: "hair-tools-accessories",
  parent_id: null,
  properties: [
    hairConditionProperty
  ],
  isActive: true
},
{
  name: "Wig Caps & Bonnets",
  slug: "wig-caps-bonnets",
  path: "wigs-extensions-haircare/hair-tools-accessories/wig-caps-bonnets",
  parentSlug: "hair-tools-accessories",
  parent_id: null,
  properties: [
    hairConditionProperty,
    colorProperty
  ],
  isActive: true
},
{
  name: "Hair Glue & Removers",
  slug: "hair-glue-removers",
  path: "wigs-extensions-haircare/hair-tools-accessories/hair-glue-removers",
  parentSlug: "hair-tools-accessories",
  parent_id: null,
  properties: [
    hairConditionProperty,
    productFormProperty
  ],
  isActive: true
},
{
  name: "Other Hair Tools & Accessories",
  slug: "other-hair-tools-accessories",
  path: "wigs-extensions-haircare/hair-tools-accessories/other-hair-tools-accessories",
  parentSlug: "hair-tools-accessories",
  parent_id: null,
  properties: [
    hairConditionProperty
  ],
  isActive: true
}


    





]
