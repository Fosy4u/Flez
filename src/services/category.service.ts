import { makeCacheKey, redis } from "../cache/redis";
import { CategoryModel } from "../models/category.model";
import { ProductModel } from "../models/product.model";
import { CategoryProperty } from "../types/category.types";

/**
 * =========================
 * Types
 * =========================
 */

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  path: string;
  parent_id?: string | null;
  properties?: CategoryProperty[];
  children: CategoryNode[];
  isLeaf: boolean;
  hasChildren: boolean;
}

/** Lite node (used in breadcrumb, children, descendants etc.) */
interface CategoryLite {
  category_id: string;
  name: string;
  slug: string;
  path: string;
  isLeaf: boolean;
  hasChildren: boolean;
}

type BreadcrumbItem = CategoryLite;

/**
 * =========================
 * In-memory stores
 * =========================
 */

let categoryTree: CategoryNode[] = [];

let categoryById = new Map<string, CategoryNode>();
let categoryByPath = new Map<string, CategoryNode>();

/**
 * =========================
 * Helpers
 * =========================
 */

const toLite = (node: CategoryNode): CategoryLite => ({
  category_id: node._id,
  name: node.name,
  slug: node.slug,
  path: node.path,
  isLeaf: node.isLeaf,
  hasChildren: node.hasChildren,
});

/**
 * =========================
 * Preload cache
 * =========================
 */

const preloadCategoryCache = async () => {
  console.log("📦 Preloading categories into memory...");

  const categories = await CategoryModel.find().lean().sort({ name: 1 });

  // Reset memory
  categoryTree = [];
  categoryById.clear();
  categoryByPath.clear();

  const map = new Map<string, CategoryNode>();

  /**
   * 1️⃣ Create nodes (FULL nodes with properties)
   */
  categories.forEach((cat) => {
    const node: CategoryNode = {
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      path: cat.path,
      parent_id: cat.parent_id?.toString() || null,
      properties: cat.properties || [],
      children: [],
      isLeaf: false,
      hasChildren: false,
    };

    map.set(node._id, node);
    categoryById.set(node._id, node);
    categoryByPath.set(node.path, node);
  });

  /**
   * 2️⃣ Build FULL tree
   */
  map.forEach((node) => {
    if (node.parent_id) {
      const parent = map.get(node.parent_id);
      parent?.children.push(node);
    } else {
      categoryTree.push(node);
    }
  });

  /**
   * 3️⃣ Compute flags
   */
  map.forEach((node) => {
    node.hasChildren = node.children.length > 0;
    node.isLeaf = node.children.length === 0;
  });

  console.log("✅ Category cache loaded");
};

/**
 * =========================
 * Get full tree (FULL)
 * =========================
 */

const getFullCategoryTree = (): CategoryNode[] => {
  return categoryTree;
};

/**
 * =========================
 * Get category by path (FULL)
 * =========================
 */

const getCategoryByPath = (path: string): CategoryNode | null => {
  return categoryByPath.get(path) || null;
};

/**
 * =========================
 * Get category by id (FULL)
 * =========================
 */

const getCategoryById = (id: string): CategoryNode | null => {
  return categoryById.get(id) || null;
};

/**
 * =========================
 * Children (LITE)
 * =========================
 */

const getChildren = (parentId: string): CategoryLite[] => {
  const parent = categoryById.get(parentId);
  if (!parent) return [];

  return parent.children.map(toLite);
};

/**
 * =========================
 * Breadcrumb (LITE)
 * =========================
 */

const getBreadcrumb = (path: string): BreadcrumbItem[] => {
  const segments = path.split("/");

  const paths = segments.map((_, i) => segments.slice(0, i + 1).join("/"));

  return paths
    .map((p) => categoryByPath.get(p))
    .filter(Boolean)
    .map((node) => toLite(node!));
};

/**
 * =========================
 * Descendants
 * (LITE for performance)
 * =========================
 */

const getDescendants = (path: string): CategoryLite[] => {
  const parent = categoryByPath.get(path);
  if (!parent) return [];

  const results: CategoryLite[] = [];

  const traverse = (node: CategoryNode) => {
    node.children.forEach((child) => {
      results.push(toLite(child));
      traverse(child);
    });
  };

  traverse(parent);

  return results;
};

/**
 * =========================
 * Properties (FULL — needed)
 * =========================
 */

const getCategoryProperties = (categoryId: string): CategoryProperty[] => {
  const category = categoryById.get(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  return category.properties || [];
};

/**
 * =========================
 * Refresh cache
 * =========================
 */

const refreshCategoryCache = async () => {
  await preloadCategoryCache();
};

const MEGA_MENU_CACHE_KEY = makeCacheKey("mega_menu_categories", {});
const MEGA_MENU_TTL = 60 * 60 * 6; // 6 hours

const buildingMegaMenuService = async () => {
 
  const cached = await redis.get(MEGA_MENU_CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }
  const activeCategories = await ProductModel.aggregate([
    {
      $match: {
        status: "live",
        disabled: false,
      },
    },
    {
      $group: {
        _id: "$category",
      },
    },
  ]);

  const activeLeafIds = new Set(activeCategories.map((c) => c._id.toString()));

  /**
   * 3️⃣ Build Menu from In-Memory Tree
   */
  const fullTree = getFullCategoryTree();

  const menu = [];

  for (const root of fullTree) {
    const secondLayer = [];

    for (const child of root.children) {
      /**
       * We need ONLY leaf descendants
       */
      const leafNodes: any[] = [];

      const collectLeaves = (node: any) => {
        if (node.isLeaf) {
          leafNodes.push(node);
          return;
        }
        node.children.forEach(collectLeaves);
      };

      collectLeaves(child);

      const activeLeaves = leafNodes
        .filter((leaf) => activeLeafIds.has(leaf._id))
        .map((leaf) => ({
          category_id: leaf._id,
          name: leaf.name,
          slug: leaf.slug,
          path: leaf.path,
        }));

      if (activeLeaves.length > 0) {
        secondLayer.push({
          category_id: child._id,
          name: child.name,
          slug: child.slug,
          path: child.path,
          children: activeLeaves,
        });
      }
    }

    if (secondLayer.length > 0) {
      menu.push({
        category_id: root._id,
        name: root.name,
        slug: root.slug,
        path: root.path,
        children: secondLayer,
      });
    }
  }

  /**
   * 4️⃣ Cache Final Result
   */
  await redis.setEx(MEGA_MENU_CACHE_KEY, MEGA_MENU_TTL, JSON.stringify(menu));

  return menu;
};

export {
  preloadCategoryCache,
  getFullCategoryTree,
  getCategoryByPath,
  getCategoryById,
  getChildren,
  getBreadcrumb,
  getDescendants,
  getCategoryProperties,
  buildingMegaMenuService,
  refreshCategoryCache,
  MEGA_MENU_CACHE_KEY
};
