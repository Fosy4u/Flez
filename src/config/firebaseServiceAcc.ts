import {FirebaseServiceAccountJSON } from "../types/firebase.types";
import { ServiceAccount } from "firebase-admin";

const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  FIREBASE_CLIENT_X509_CERT_URL,
} = process.env;

// Fail fast if config is invalid
if (
  !FIREBASE_TYPE ||
  !FIREBASE_PROJECT_ID ||
  !FIREBASE_PRIVATE_KEY_ID ||
  !FIREBASE_PRIVATE_KEY ||
  !FIREBASE_CLIENT_EMAIL ||
  !FIREBASE_CLIENT_ID ||
  !FIREBASE_AUTH_URI ||
  !FIREBASE_TOKEN_URI ||
  !FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
  !FIREBASE_CLIENT_X509_CERT_URL
) {
  throw new Error("Missing Firebase environment variables");
}

const serviceAccountJSON: FirebaseServiceAccountJSON = {
  type: FIREBASE_TYPE,
  project_id: FIREBASE_PROJECT_ID,
  private_key_id: FIREBASE_PRIVATE_KEY_ID,
  private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: FIREBASE_CLIENT_EMAIL,
  client_id: FIREBASE_CLIENT_ID,
  auth_uri: FIREBASE_AUTH_URI,
  token_uri: FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: FIREBASE_CLIENT_X509_CERT_URL,
};

// 🔑 Map JSON → ServiceAccount
const firebaseServiceAccount: ServiceAccount = {
  projectId: serviceAccountJSON.project_id,
  clientEmail: serviceAccountJSON.client_email,
  privateKey: serviceAccountJSON.private_key,
};

export { firebaseServiceAccount, serviceAccountJSON };
