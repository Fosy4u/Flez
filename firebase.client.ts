import "dotenv/config";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};
if(!firebaseConfig.apiKey) {
  console.log("🔥 FIREBASE_API_KEY:", process.env.FIREBASE_API_KEY);
  throw new Error("Missing Firebase client apiKey environment variable");

}
if(!firebaseConfig.authDomain) {
  throw new Error("Missing Firebase client authDomain environment variable");

}
if(!firebaseConfig.projectId) {
  throw new Error("Missing Firebase client projectId environment variable");    

}
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function getToken() {
  const email = process.env.FIREBASE_TEST_USER_EMAIL!;
  const password = process.env.FIREBASE_TEST_USER_PASSWORD!;
  if (!email || !password) {
    throw new Error("Missing Firebase test user credentials");
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const token = await userCredential.user.getIdToken();
  console.log("🔥 Firebase ID Token:\n", token);
}

getToken().catch(console.error);
