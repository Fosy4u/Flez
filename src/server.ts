import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";
import { Server } from "socket.io";

import app from "./app";
import dbConfig from "./config/db";
import { ENV } from "./config/env.config";
import { warmUpBrandCache } from "./helpers/brand.helper";
import { preloadCategoryCache } from "./services/category.service";
import { redis } from "./cache/redis";

const PORT = Number(process.env.PORT) || 8080;

export const startServer = async (): Promise<void> => {
  try {
    // ---------- Database ----------
    await mongoose.connect(dbConfig.url, {
      serverApi: ServerApiVersion.v1,
    });

    console.log("MongoDB connected:", ENV);
    // ---------- Warm-up brand cache ----------
    await warmUpBrandCache();
    // ---------- Warm-up category cache ----------
    await preloadCategoryCache();

    if (process.env.FLUSH_REDIS_ON_START === "true") {
      console.log(
        "⚠️ FLUSH_REDIS_ON_START is enabled. Flushing all Redis cache...",
      );
      redis
        .flushDb()
        .then(() => {
          console.log("✅ Redis cache flushed");
        })
        .catch((err) => {
          console.error("❌ Error flushing Redis cache:", err);
        });
    }

    // ---------- HTTP Server ----------
    const server = http.createServer(app);

    // ---------- Socket.IO ----------
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    const sockets: Record<string, string> = {};

    io.on("connection", (socket) => {
      socket.on("connectInit", (sessionId: string) => {
        sockets[sessionId] = socket.id;
        app.set("sockets", sockets);
      });
    });

    app.set("io", io);
    app.set("sockets", sockets);

    // ---------- Listen ----------
    server.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} | ENV=${ENV} | FE=${process.env.FRONTEND_VERSION}`,
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

// Auto start
startServer();
