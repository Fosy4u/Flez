import {  AppEnv } from "../types/env.types";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 8080;

if (Number.isNaN(PORT)) {
  throw new Error("PORT must be a valid number");
}

const ALLOWED_ENVS: readonly AppEnv[] = ["dev", "prod", "test"];

/**
 * Validate and return APP_ENV
 */
const resolveAppEnv = (): AppEnv => {
  const env = process.env.ENV

  if (!env) {
    console.error("❌ APP_ENV is not set");
    process.exit(1);
  }

  if (!ALLOWED_ENVS.includes(env as AppEnv)) {
    console.error(
      `❌ Invalid APP_ENV="${env}". Allowed values: ${ALLOWED_ENVS.join(", ")}`
    );
    process.exit(1);
  }

  return env as AppEnv;
};

 const ENV: AppEnv = resolveAppEnv();
const BASE_URL =
  process.env.APP_BASE_URL ??
  "http://localhost:8080"; // fallback only for local safety




export {   ENV, PORT, BASE_URL };
