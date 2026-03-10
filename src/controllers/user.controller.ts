import { Request, Response } from "express";
import { UserDocument, UserModel } from "../models/user.model";
import {
  canAccessUser,
  generateMarketplaceUserName,
  isAdminOrSuperAdmin,
  storeUserProfileImage,
} from "../services/user.services";
import path from "path";
import { userCache } from "../cache/user.cache";
import { deleteImageFromFirebase, deleteLocalFile } from "../helpers/utils";
import root from "../root";

const addUser = async (req: any, res: Response) => {
  try {
    const firebaseUser = req.authUser;
    const { uid, email, emailVerified, firebase } = firebaseUser || {};

    const sign_in_provider = firebase?.sign_in_provider;

    if (!uid) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const { firstName, lastName, phoneNumber } = req.body;

    // 🔐 Email mismatch check
    if (
      !req.body.email ||
      req.body.email === "" ||
      req.body.email === null ||
      req.body.email === undefined
    ) {
      return res.status(400).send({
        error: "Email is reaquired",
      });
    }
    if (!email) {
      return res.status(400).send({
        error:
          "Email not found in token. Please re-authenticate or ensure your auth account has a valid email.",
      });
    }
    if (email?.toLowerCase() !== req.body.email?.toLowerCase()) {
      return res.status(403).send({
        error: "Email does not match authenticated account",
      });
    }

    // Required fields
    if (!firstName || !lastName) {
      return res.status(400).send({
        error: "First name and last name are required",
      });
    }

    // Prevent duplicate user
    const existingUser = await UserModel.findOne({ uid });
    if (existingUser) {
      return res.status(400).send({
        error: "User already exists",
      });
    }

    const userName = await generateMarketplaceUserName();

    const user = new UserModel({
      uid,
      email, // 👈 always from token,
      userName,
      firstName,
      lastName,
      phoneNumber,
      emailVerified,
      source: sign_in_provider || "unknown",
    });

    const savedUser = await user.save();

    userCache.set(uid, savedUser);

    return res.status(200).send({
      message: "User created successfully",
      data: savedUser,
    });
  } catch (err: any) {
    return res.status(500).send({
      error: err.message || "Server error",
    });
  }
};

const getUserByUid = async (req: Request, res: Response) => {
  try {
    const authUid = req.authUser?.uid;
    const targetUid = req.params.uid;

    if (!authUid) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    if (!targetUid) {
      return res.status(400).send({ error: "User Uid not provided" });
    }

    // ---------- Auth user (from DB or cache) ----------
    const authUser: UserDocument =
      userCache.get(authUid) ||
      (await UserModel.findOne({ uid: authUid }).lean());

    if (!authUser) {
      return res.status(403).send({ error: "Access denied" });
    }

    if (!canAccessUser(authUid, targetUid, authUser)) {
      return res.status(403).send({ error: "Permission denied" });
    }

    // ---------- Cache ----------
    const cachedUser = userCache.get(targetUid);
    if (cachedUser) {
      return res.status(200).send({
        data: cachedUser,
        message: "User fetched successfully",
      });
    }

    // ---------- DB ----------
    const user = await UserModel.findOne({ uid: targetUid }).lean();
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    userCache.set(targetUid, user);

    return res.status(200).send({
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).send({ error: "Unable to fetch user" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const authUid = req.authUser?.uid;
    const targetUid = req.params.uid;

    if (!authUid) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    if (!targetUid) {
      return res.status(400).send({ error: "User Uid not provided" });
    }

    const authUser: UserDocument =
      userCache.get(authUid) ||
      (await UserModel.findOne({ uid: authUid }).lean());

    if (!authUser || !canAccessUser(authUid, targetUid, authUser)) {
      return res.status(403).send({ error: "Permission denied" });
    }

    const { firstName, lastName, email, phoneNumber, ...rest } = req.body;

    if (!firstName?.trim()) {
      return res.status(400).send({ error: "First name is required" });
    }

    if (!lastName?.trim()) {
      return res.status(400).send({ error: "Last name is required" });
    }

    if (!email?.trim()) {
      return res.status(400).send({ error: "Email is required" });
    }

    if (!phoneNumber?.trim()) {
      return res.status(400).send({ error: "Phone number is required" });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { uid: targetUid },
      {
        $set: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          ...rest,
        },
      },
      { new: true },
    ).lean();

    if (!updatedUser) {
      return res.status(404).send({ error: "User not found" });
    }

    userCache.set(targetUid, updatedUser);

    return res.status(200).send({
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0];
      return res.status(409).send({ error: `${field} already exists` });
    }

    return res.status(500).send({ error: "Unable to update user" });
  }
};

const disableUser = async (req: Request, res: Response) => {
  try {
    const authUid = req.authUser?.uid;
    const targetUid = req.params.uid;

    if (!authUid) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const authUser: UserDocument =
      userCache.get(authUid) ||
      (await UserModel.findOne({ uid: authUid }).lean());

    if (!authUser || !canAccessUser(authUid, targetUid, authUser)) {
      return res.status(403).send({ error: "Permission denied" });
    }

    const disabledUser = await UserModel.findOneAndUpdate(
      { uid: targetUid },
      {
        $set: {
          disabled: true,
          disabledAt: new Date(),
          disabledBy: authUid,
        },
      },
      { new: true },
    ).lean();

    if (!disabledUser) {
      return res.status(404).send({ error: "User not found" });
    }

    userCache.del(targetUid);

    return res.status(200).send({
      data: disabledUser,
      message: "User disabled successfully",
    });
  } catch (error) {
    console.error("Disable user error:", error);
    return res.status(500).send({ error: "Unable to disable user" });
  }
};

const restoreUser = async (req: Request, res: Response) => {
  try {
    const authUid = req.authUser?.uid;
    const targetUid = req.params.uid;

    if (!authUid) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const authUser: UserDocument =
      userCache.get(authUid) ||
      (await UserModel.findOne({ uid: authUid }).lean());

    if (!authUser || !canAccessUser(authUid, targetUid, authUser)) {
      return res.status(403).send({ error: "Permission denied" });
    }

    const restoredUser = await UserModel.findOneAndUpdate(
      { uid: targetUid },
      {
        $set: { disabled: false },
        $unset: { disabledAt: "", disabledBy: "" },
      },
      { new: true },
    ).lean();

    if (!restoredUser) {
      return res.status(404).send({ error: "User not found" });
    }

    userCache.set(targetUid, restoredUser);

    return res.status(200).send({
      data: restoredUser,
      message: "User restored successfully",
    });
  } catch (error) {
    console.error("Restore user error:", error);
    return res.status(500).send({ error: "Unable to restore user" });
  }
};

/**
 * GET ALL USERS (Admin / SuperAdmin only)
 */
const getUsers = async (req: Request, res: Response) => {
  try {
    const authUid = req.authUser?.uid; // injected by authMiddleware

    if (!authUid) {
      return res.status(400).send({ error: "Authenticated user not found" });
    }

    const authUser: UserDocument =
      userCache.get(authUid) ||
      (await UserModel.findOne({ uid: authUid }).lean());

    if (!isAdminOrSuperAdmin(authUser)) {
      return res.status(403).send({ error: "Access denied" });
    }

    const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();

    return res.status(200).send({
      data: users,
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("getUsers error:", error);
    return res.status(500).send({ error: "Failed to fetch users" });
  }
};
const getAuthenticatedUser = async (req: any, res: Response) => {
  try {
    const { uid } = req.authUser || {};

    if (!uid) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const user = await UserModel.findOne({ uid }).lean();

    if (!user) {
      return res.status(404).send({
        error: "User not found. Please complete registration.",
      });
    }

    return res.status(200).send({
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    return res.status(500).send({ error: "Server error" });
  }
};

const uploadUserProfilePic = async (req: any, res: Response) => {
  let imageUrl: {
    name: string;
    link: string;
  } | null = null;
  try {
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }
    const authUser = req.authUser;

    if (!authUser || !authUser._id) {
      return res.status(401).send({ error: "Unauthorized" });
    }
    const _id = authUser._id;
    const user = await UserModel.findById(_id);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    const filename = req.file.filename;
    imageUrl = await storeUserProfileImage(req, filename);
    const updatedUser = await UserModel.findByIdAndUpdate(
      _id,
      { imageUrl },
      { new: true },
    ).lean();

    if (!updatedUser) {
      if (imageUrl?.name) {
        await deleteImageFromFirebase("/user/" + imageUrl.name);
      }
      return res.status(404).send({ error: "User not found" });
    }

    userCache.set(updatedUser.uid, updatedUser);

    return res.status(200).send({
      data: updatedUser,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    if (imageUrl?.name) {
      await deleteImageFromFirebase("/user/" + imageUrl.name);
    }
    if (req.file?.filename) {
      const source = path.join(root + "/uploads/" + req.file.filename);
      const resizedPath = path.resolve(
        req.file.destination,
        "resized",
        req.file.filename,
      );
      await deleteLocalFile(source);
      await deleteLocalFile(resizedPath);
    }

    return res.status(500).send({ error: "Failed to upload profile picture" });
  }
};

export {
  addUser,
  getUserByUid,
  updateUser,
  disableUser,
  restoreUser,
  getUsers,
  getAuthenticatedUser,
  uploadUserProfilePic,
};
