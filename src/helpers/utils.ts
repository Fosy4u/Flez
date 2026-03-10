import { Types } from "mongoose";
import fs from "fs";
import { BUCKET_NAME, storageRef } from "../config/firebase";
const isValidObjectId = (id: string): boolean => {
  if (Types.ObjectId.isValid(id)) {
    return String(new Types.ObjectId(id)) === id;
  }
  return false;
};
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const deleteLocalFile = async (path: string): Promise<void> => {
  return new Promise((resolve) => {
    fs.unlink(path, (error) => {
      error && console.log("WARNING:: Delete local file", error);
      resolve();
    });
  });
};

const deleteImageFromFirebase = async (urlOrPath: string): Promise<boolean> => {
  try {
    if (!urlOrPath) return false;

    let filePath = urlOrPath;
    if (!BUCKET_NAME) {
      console.error("Firebase bucket name is not defined.");
      return false;
    }
    // If full public URL, extract path
    if (urlOrPath.includes(BUCKET_NAME)) {
      const parts = urlOrPath.split(`${BUCKET_NAME}/`);
      if (parts.length < 2) return false;
      filePath = decodeURIComponent(parts[1]);
    }

    await storageRef.file(filePath).delete();

    return true;
  } catch (error) {
    console.error("Firebase delete error:", error);
    return false;
  }
};

export {
  isValidObjectId,
  getRandomInt,
  deleteLocalFile,
  deleteImageFromFirebase,
};
