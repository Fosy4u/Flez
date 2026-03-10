import { Router } from "express";
import {
  getFullCategoryTreeController,
  getMegaMenuController,
  getCategoryByPathController,
  getCategoryByIdController,
  getCategoryChildrenController,
  getCategoryPropertiesController,
  getCategoryBreadcrumbController,
  getCategoryDescendantsController,
  refreshCategoryCacheController,
} from "../controllers/category.controller";

import {
  authMiddleware,
  adminOnlyMiddleware,
} from "../middleware/firebaseUserAuth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category catalog & navigation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         category_id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         path:
 *           type: string
 *         level:
 *           type: number
 *         parent_id:
 *           type: string
 *           nullable: true
 *         hasChildren:
 *           type: boolean
 *         isLeaf:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *
 *     CategoryProperty:
 *       type: object
 *       properties:
 *         property_id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         isRequired:
 *           type: boolean
 *
 *     ApiSuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           nullable: true
 *
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

//
// -------------------- PUBLIC CATALOG --------------------
//

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     summary: Get full category tree
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category tree fetched
 */
router.get("/categories/tree", getFullCategoryTreeController);

/**
 * @swagger
 * /categories/mega-menu:
 *   get:
 *     summary: Get mega menu categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Mega menu categories fetched
 */
router.get("/categories/mega-menu", getMegaMenuController);

/**
 * @swagger
 * /categories/path/{path}:
 *   get:
 *     summary: Get category by full path
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Full category path
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *       404:
 *         description: Category not found
 */
router.get("/categories/path/*", getCategoryByPathController);

/**
 * @swagger
 * /categories/{id}/children:
 *   get:
 *     summary: Get category children
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Children fetched successfully
 */
router.get("/categories/:id/children", getCategoryChildrenController);

/**
 * @swagger
 * /categories/{id}/properties:
 *   get:
 *     summary: Get category properties
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Properties fetched successfully
 */
router.get("/categories/:id/properties", getCategoryPropertiesController);

/**
 * @swagger
 * /categories/{path}/breadcrumb:
 *   get:
 *     summary: Get category breadcrumb
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Breadcrumb fetched successfully
 */
router.get("/categories/:path/breadcrumb", getCategoryBreadcrumbController);

/**
 * @swagger
 * /categories/{path}/descendants:
 *   get:
 *     summary: Get all category descendants
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Descendants fetched successfully
 */
router.get("/categories/:path/descendants", getCategoryDescendantsController);

//
// -------------------- ADMIN --------------------
//

/**
 * @swagger
 * /categories/refresh-cache:
 *   post:
 *     summary: Refresh category cache (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache refreshed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/categories/refresh-cache",
  authMiddleware,
  adminOnlyMiddleware,
  refreshCategoryCacheController
);

export default router;