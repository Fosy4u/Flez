// routes/product.routes.ts
import { Router } from "express";

import {
  getCategoryTreeForProductController,
  addEditProductBasicInfoController,
  getProductCategoryPropertiesController,
  saveProductCategoryPropertiesController,
  saveProductVariantPropertiesController,
  completeProductImagesStage,
  getProductImageUploadUrlController,
  markDefaultImageController,
  getVariantOptionsController,
  saveProductVariantsController,
  submitProductController,
  getAuthShopProductsController,
  getLiveProductsController,
  getProductDetailsController,
  deleteProductImageController,
  changeProductStatusController,
  toggleDeleteRestoreProductController,
} from "../controllers/product.contoller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/firebaseUserAuth.middleware";

const router = Router();


/**
 * =========================
 * CATEGORY TREE (Stage 1)
 * =========================
 */

/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Fetch full category tree for product creation
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 */
router.get("/products/categories", getCategoryTreeForProductController);

/**
 * =========================
 * ADD / EDIT BASIC INFO (Stage 1)
 * =========================
 */

/**
 * @swagger
 * /products/basic-info:
 *   post:
 *     summary: Add or edit product basic info (Stage 1)
 *     tags: [Products]
 *     requestBody:
 *       description: Product basic info payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode:
 *                 type: string
 *                 enum: [add, edit]
 *               productId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               brand_slug:
 *                 type: string
 *               category_slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop or brand not found
 */
router.post("/products/basic-info",authMiddleware, addEditProductBasicInfoController);

/**
 * =========================
 * CATEGORY PROPERTIES (Stage 2)
 * =========================
 */

/**
 * @swagger
 * /products/{productId}/properties:
 *   get:
 *     summary: Get non-variant and variant properties for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product properties fetched successfully
 *       404:
 *         description: Product or category not found
 */
router.get(
  "/products/:productId/properties",
  authMiddleware,
  getProductCategoryPropertiesController,
);

/**
 * @swagger
 * /products/{productId}/properties:
 *   post:
 *     summary: Save non-variant category properties for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       description: Key-value pairs of non-variant properties
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               properties:
 *                 type: object
 *     responses:
 *       200:
 *         description: Properties saved successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product or category not found
 */
router.post(
  "/products/:productId/properties",
  authMiddleware,
  saveProductCategoryPropertiesController,
);

/**
 * =========================
 * VARIANT PROPERTIES (Stage 3)
 * =========================
 */

/**
 * @swagger
 * /products/{productId}/variant-properties:
 *   post:
 *     summary: Save variant property options for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       description: Variant property options as key → string[]
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variantProperties:
 *                 type: object
 *     responses:
 *       200:
 *         description: Variant properties saved successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product or category not found
 */
router.post(
  "/products/:productId/variant-properties",
  authMiddleware,
  saveProductVariantPropertiesController,
);

/**
 * =========================
 * IMAGES STAGE (Stage 4)
 * =========================
 */

/**
 * @swagger
 * /products/{productId}/images/complete:
 *   post:
 *     summary: Complete product image stage
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product images stage completed
 */
router.post("/products/:productId/images/complete", authMiddleware, completeProductImagesStage);

/**
 * @swagger
 * /products/{productId}/images/upload-url/{color}:
 *   get:
 *     summary: Get signed URL for uploading product images
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: color
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upload URL returned successfully
 */
router.get(
  "/products/:productId/images/upload-url/:color",
  authMiddleware,
  getProductImageUploadUrlController,
);

/**
 * @swagger
 * /products/images/default:
 *   post:
 *     summary: Mark an image as default for a product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               fileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Default image updated successfully
 */
router.post("/products/images/default", authMiddleware, markDefaultImageController);

/**
 * =========================
 * VARIANT OPTIONS (Stage 5)
 * =========================
 */

/**
 * @swagger
 * /products/{productId}/variant-options:
 *   get:
 *     summary: Get all variant combinations for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Variant options fetched successfully
 */
router.get("/products/:productId/variant-options", authMiddleware, getVariantOptionsController);

/**
 * @swagger
 * /products/{productId}/variants:
 *   post:
 *     summary: Save variants for a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Array of variant payloads
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attributes:
 *                       type: object
 *                     price:
 *                       type: number
 *                     stock:
 *                       type: number
 *     responses:
 *       200:
 *         description: Variants saved successfully
 */
router.post("/products/:productId/variants", authMiddleware, saveProductVariantsController);

/**
 * =========================
 * SUBMIT PRODUCT (Stage 6)
 * =========================
 */

/**
 * @swagger
 * /products/{productId}/submit:
 *   post:
 *     summary: Submit product for review
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product submitted successfully
 */
router.post("/products/:productId/submit", authMiddleware, submitProductController);

/**
 * =========================
 * SHOP & LIVE PRODUCTS
 * =========================
 */

/**
 * @swagger
 * /products/shop:
 *   get:
 *     summary: Get products for authenticated shop
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
router.get("/products/shop", authMiddleware, getAuthShopProductsController);

/**
 * @swagger
 * /products/live:
 *   get:
 *     summary: Get public live products (supports filters & pagination)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price_asc, price_desc]
 *     responses:
 *       200:
 *         description: Live products fetched successfully
 */
router.get("/products/live", getLiveProductsController);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get detailed product information
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details fetched successfully
 */
router.get("/products/:productId", getProductDetailsController);

/**
 * =========================
 * DELETE / IMAGE / STATUS
 * =========================
 */

/**
 * @swagger
 * /products/{productId}/images/{fileName}:
 *   delete:
 *     summary: Delete a product image
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete(
  "/products/:productId/images/:fileName",
  authMiddleware,
  deleteProductImageController,
);

/**
 * @swagger
 * /products/{productId}/status:
 *   patch:
 *     summary: Change product status
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Status payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, under_review, live, rejected]
 *               rejectionReasons:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product status updated successfully
 */
router.patch("/products/:productId/status", authMiddleware, changeProductStatusController);

/**
 * @swagger
 * /products/{productId}/toggle-delete:
 *   post:
 *     summary: Delete or restore a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Action payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [delete, restore]
 *     responses:
 *       200:
 *         description: Product deleted or restored successfully
 */
router.post(
  "/products/:productId/toggle-delete",
  authMiddleware,
  toggleDeleteRestoreProductController,
);

export default router;
