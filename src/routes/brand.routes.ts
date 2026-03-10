// routes/brand.routes.ts
import { Router } from "express";
import {
  getAllBrands,
  approveBrand,
  toggleBrandFilterable,
  updateBrandName,
  disableBrand,
  deleteCustomBrand,
} from "../controllers/brand.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/firebaseUserAuth.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateBrandRequest:
 *       type: object
 *       required:
 *         - name
 *         - propagateSnapshots
 *       properties:
 *         name:
 *           type: string
 *         propagateSnapshots:
 *           type: string
 *           enum: [yes, no]
 *
 *     ToggleFilterableRequest:
 *       type: object
 *       required:
 *         - isFilterable
 *       properties:
 *         isFilterable:
 *           type: boolean
 *
 *     Brand:
 *       type: object
 *       properties:
 *         brand_id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         type:
 *           type: string
 *         isApproved:
 *           type: boolean
 *         isFilterable:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         departments:
 *           type: array
 *           items:
 *             type: string
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

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Brand management
 */

// ----------------- Routes -----------------

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brands fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user is not admin)
 */
router.get("/brands", getAllBrands);

/**
 * @swagger
 * /brands/{brand_id}/approve:
 *   patch:
 *     summary: Approve a custom brand (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand approved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Brand'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Brand not found
 */
router.patch("/brands/:brand_id/approve", authMiddleware, adminOnlyMiddleware, approveBrand);

/**
 * @swagger
 * /brands/{brand_id}/filterable:
 *   patch:
 *     summary: Toggle brand filterable (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleFilterableRequest'
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Brand not found
 */
router.patch("/brands/:brand_id/filterable", authMiddleware, adminOnlyMiddleware, toggleBrandFilterable);

/**
 * @swagger
 * /brands/{brand_id}:
 *   patch:
 *     summary: Update brand name and optionally propagate snapshots (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBrandRequest'
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Brand not found
 */
router.patch("/brands/:brand_id", authMiddleware, adminOnlyMiddleware, updateBrandName);

/**
 * @swagger
 * /brands/{brand_id}/disable:
 *   patch:
 *     summary: Disable brand (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Brand'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Brand not found
 */
router.patch("/brands/:brand_id/disable", authMiddleware, adminOnlyMiddleware, disableBrand);

/**
 * @swagger
 * /brands/{brand_id}:
 *   delete:
 *     summary: Delete custom brand (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       400:
 *         description: Cannot delete brand with products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Brand not found
 */
router.delete("/brands/:brand_id", authMiddleware, adminOnlyMiddleware, deleteCustomBrand);

export default router;
