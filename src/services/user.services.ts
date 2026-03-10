import { UserDocument, UserModel } from "../models/user.model";
import crypto from "crypto";
import root from "../root";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { deleteLocalFile } from "../helpers/utils";
import { storageRef } from "../config/firebase";

export interface UploadedImageUrl {
  link: string;
  name: string;
}

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const canAccessUser = (
  authUid: string,
  targetUid: string,
  authUser: UserDocument,
): boolean => {
  if (authUid === targetUid) return true;
  if (authUser.isSuperAdmin) return true;
  if (authUser.isAdmin) return true;
  return false;
};
const isAdminOrSuperAdmin = (user: UserDocument | null): boolean => {
  if (!user) return false;
  return Boolean(user.isAdmin || user.isSuperAdmin);
};

/**
 * Word lists (can be extended anytime without breaking old users)
 */
const ADJECTIVES = [
  "urban",
  "silent",
  "swift",
  "golden",
  "brave",
  "lucky",
  "smart",
  "bright",
  "fierce",
  "clever",
  "quick",
  "steady",
  "bold",
  "mighty",
  "calm",
  // 🔥 expand freely (500–2000 words recommended)
];

/**
 * Generate a short base36 string
 */
const generateBase36 = (length = 4): string => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, length)
    .toLowerCase();
};

/**
 * Pick random item
 */
const pickRandom = (arr: string[]): string =>
  arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a unique marketplace username
 */
const generateMarketplaceUserName = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const adjective = pickRandom(ADJECTIVES);
    const suffix = generateBase36(5); // 🔥 5 chars

    const userName = `${adjective}-${suffix}`;

    const exists = await UserModel.exists({ userName });
    if (!exists) return userName;
  }

  return `user-${crypto.randomBytes(4).toString("hex")}`;
};
//saving image to firebase storage
const storeUserProfileImage = async (
  req: MulterRequest,
  filename: string,
): Promise<UploadedImageUrl> => {
  let url = {} as UploadedImageUrl;

  if (filename) {
    const source = path.join(root + "/uploads/" + filename);
    await sharp(source)
      .resize(1024, 1024)
      .jpeg({ quality: 90 })
      .toFile(path.resolve(req.file.destination, "resized", filename));
    const storage = await storageRef.upload(
      path.resolve(req.file.destination, "resized", filename),
      {
        public: true,
        destination: `user/${filename}`,
        metadata: {
          cacheControl: "public, max-age=31536000, immutable", // 1 year caching
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    );
    url = {
      link: `https://storage.googleapis.com/${storageRef.name}/user/${filename}`,
      name: filename,
    };
    const deleteSourceFile = await deleteLocalFile(source);
    const deleteResizedFile = await deleteLocalFile(
      path.resolve(req.file.destination, "resized", filename),
    );
    await Promise.all([deleteSourceFile, deleteResizedFile]);
    return url;
  }
  return url;
};

export {
  canAccessUser,
  isAdminOrSuperAdmin,
  generateMarketplaceUserName,
  storeUserProfileImage,
};
