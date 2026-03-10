// cache/redisClient.ts
import { createClient } from "redis";
import crypto from "crypto";
import { ENV } from "../config/env.config";

const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST, // Your Redis Cloud host URL goes here
    port: Number(process.env.REDIS_PORT) || 19442,
  },
});

redis.on("connect", () => console.log("✅ Connected to Redis Cloud"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

redis.connect();

const makeCacheKey = (prefix: string, data: unknown) => {
  const hash = crypto
    .createHash("sha1")
    .update(JSON.stringify(data))
    .digest("hex");
  return `${ENV}:${prefix}:${hash}`;
};
const deleteRedisKeysByPrefix = async (prefix: string) => {
  try {
    let cursor = "0";
    let totalDeleted = 0;

    do {
      // Ensure cursor is a string
      const { cursor: nextCursor, keys } = await redis.scan(
        cursor,
        {
          MATCH: `${prefix}*`,
          COUNT: 100,
        }
      );

      if (keys && keys.length > 0) {
        const pipeline = redis.multi();
        for (const key of keys) {
          pipeline.del(key);
        }

        const results = await pipeline.exec();
        totalDeleted += results?.length || 0;
      }

      cursor = nextCursor;
    } while (cursor !== "0");

    console.log(`✅ Deleted ${totalDeleted} Redis keys with prefix: ${prefix}`);
  } catch (err) {
    console.error(`❌ Failed to delete keys with prefix ${prefix}:`, err);
  }
};

export { makeCacheKey, deleteRedisKeysByPrefix , redis };
