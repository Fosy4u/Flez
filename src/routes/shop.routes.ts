import { Router } from "express";
import {
  createMyShop,
  getMyShop,
  updateMyShop,
  adminUpdateShopStatus,
  getAllShops,
  getShopByShopId,
} from "../controllers/shop.controller";
import { authMiddleware, adminOnlyMiddleware } from "../middleware/firebaseUserAuth.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateShopRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         legalName:
 *           type: string
 *
 *     UpdateShopRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         legalName:
 *           type: string
 *         logo:
 *           type: string
 *         banner:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *             state:
 *               type: string
 *             city:
 *               type: string
 *             street:
 *               type: string
 *             postalCode:
 *               type: string
 *         contactInfo:
 *           type: object
 *           properties:
 *             supportEmail:
 *               type: string
 *             supportPhone:
 *               type: string
 *         bankDetails:
 *           type: object
 *           properties:
 *             bankName:
 *               type: string
 *             accountName:
 *               type: string
 *             accountNumber:
 *               type: string
 *
 *     Shop:
 *       type: object
 *       properties:
 *         shopId:
 *           type: string
 *         owner:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         legalName:
 *           type: string
 *         logo:
 *           type: string
 *         banner:
 *           type: string
 *         address:
 *           type: object
 *         contactInfo:
 *           type: object
 *         bankDetails:
 *           type: object
 *         isVerified:
 *           type: boolean
 *         status:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
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
 *   name: Shops
 *   description: Shop management
 */

// ---------------- User Routes ----------------

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Create a new shop for logged-in user
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShopRequest'
 *     responses:
 *       201:
 *         description: Shop created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Shop'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/shops", authMiddleware, createMyShop);

/**
 * @swagger
 * /shops/me:
 *   get:
 *     summary: Get logged-in user's shop
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found
 */
router.get("/shops/me", authMiddleware, getMyShop);

/**
 * @swagger
 * /shops/me:
 *   put:
 *     summary: Update logged-in user's shop
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShopRequest'
 *     responses:
 *       200:
 *         description: Shop updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shop not found
 */
router.put("/shops/me", authMiddleware, updateMyShop);

// ---------------- Admin Routes ----------------

/**
 * @swagger
 * /shops/{shopId}/status:
 *   patch:
 *     summary: Update shop status (Admin only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, active, suspended, rejected]
 *     responses:
 *       200:
 *         description: Shop status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Shop not found
 */
router.patch(
  "/shops/:shopId/status",
  authMiddleware,
  adminOnlyMiddleware,
  adminUpdateShopStatus
);

/**
 * @swagger
 * /shops:
 *   get:
 *     summary: Get all shops (Admin only, optional status filter)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, suspended, rejected]
 *         required: false
 *         description: Filter shops by status
 *     responses:
 *       200:
 *         description: Shops fetched successfully
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
 *                         $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get("/shops", authMiddleware, adminOnlyMiddleware, getAllShops);

/**
 * @swagger
 * /shops/{shopId}:
 *   get:
 *     summary: Get shop by shopId (Admin only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shop fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Shop'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Shop not found
 */
router.get("/shops/:shopId", authMiddleware, adminOnlyMiddleware, getShopByShopId);

export default router;
