import { Router } from "express";
import {
  addUser,
  getUserByUid,
  updateUser,
  disableUser,
  restoreUser,
  getUsers,
  getAuthenticatedUser,
} from "../controllers/user.controller";
import { adminOnlyMiddleware, authMiddleware } from "../middleware/firebaseUserAuth.middleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - phoneNumber
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string        
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *         userName:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         isAdmin:
 *           type: boolean
 *         isSuperAdmin:
 *           type: boolean
 *         disabled:
 *           type: boolean
 *         points:
 *           type: number
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
 *   name: Users
 *   description: User management
 */

// ----------------- Routes -----------------

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error (missing fields, invalid email, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       401:
 *         description: Unauthorized (invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post("/users", authMiddleware, addUser);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       404:
 *         description: User not registered in database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/users/me", authMiddleware, getAuthenticatedUser);

/**
 * @swagger
 * /users/{uid}:
 *   get:
 *     summary: Get user by Firebase UID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *       403:
 *         description: Forbidden (user is not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/users/:uid", authMiddleware, adminOnlyMiddleware, getUserByUid);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
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
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (invalid token)
 *       403:
 *         description: Forbidden (user is not admin)
 */
router.get("/users", authMiddleware, adminOnlyMiddleware, getUsers);

/**
 * @swagger
 * /users/{uid}:
 *   put:
 *     summary: Update user (must include firstName and lastName)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error (firstName or lastName missing)
 *       401:
 *         description: Unauthorized
 */
router.put("/users/:uid", authMiddleware, updateUser);

/**
 * @swagger
 * /users/{uid}:
 *   patch:
 *     summary: Disable user (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User disabled successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/users/:uid", authMiddleware, disableUser);

/**
 * @swagger
 * /users/{uid}/restore:
 *   patch:
 *     summary: Restore user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User restored successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user is not admin)
 */
router.patch("/users/:uid/restore", authMiddleware, adminOnlyMiddleware, restoreUser);

export default router;
