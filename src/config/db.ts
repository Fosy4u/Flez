
import {ENV} from "./env.config";
// ---------- Types ----------

export interface DbConfig {
  url: string;
  database: string;
  imgBucket: string;
}

// ---------- Config ----------

const url =
  ENV === "prod"
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI_DEV;

if (!url) {
  throw new Error("Missing MongoDB connection string");
}

const dbConfig: DbConfig = {
  url,
  database: "Data1",
  imgBucket: "pictures",
};

export default dbConfig;
