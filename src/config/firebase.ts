import "dotenv/config";
import firebaseAdmin from "firebase-admin";
import { App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { ENV } from "./env.config";
import { firebaseServiceAccount } from "./firebaseServiceAcc";

// Initialize Firebase app
const firebase: App = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
});

// Firebase services (modular getters)
const messaging = getMessaging(firebase);
const auth = getAuth(firebase);

// Resolve bucket name by environment
const BUCKET_NAME =
  ENV === "prod"
    ? process.env.STORAGE_BUCKET_PROD
    : process.env.STORAGE_BUCKET_DEV;

if (!BUCKET_NAME) {
  throw new Error("Missing Firebase storage bucket environment variable");
}

// Firebase storage
const storageRef = getStorage(firebase).bucket(BUCKET_NAME);

// ---------- Helpers ----------

const deleteUserFromFirebase = async (uid: string): Promise<void> => {
  await auth.deleteUser(uid);
};

// ---------- Exports ----------

export {
  firebase,
  messaging,
  auth,
  storageRef,
  deleteUserFromFirebase,
  BUCKET_NAME
};
