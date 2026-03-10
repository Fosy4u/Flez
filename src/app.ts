import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import { setupSwagger } from "./swagger";
import { ENV } from "./config/env.config";
import initRoutes from "./routes";
import root from "./root";

const app: Application = express();


// ---------- CORS ----------
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["f-version"],
  }),
);
// ---------- Static assets ----------
app.use(express.static(path.join(__dirname, "public")));

// ---------- Rate limiting ----------
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
      result: "fail",
      error: { code: 1000, message: "Too many requests, please try again." },
    },
  }),
);

// ---------- Body parsing ----------
app.use(
  bodyParser.json({
    limit: "500mb",
  }),
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "500mb",
    parameterLimit: 1_000_000,
  }),
);
// Serve static assets like /images/logo.png
app.use(express.static(path.join(root, "public")));



// ---------- Headers ----------
app.use((req: Request, res: Response, next: NextFunction) => {
  res.append("f-version", process.env.FRONTEND_VERSION ?? "unknown");
  res.append("X-Env", ENV);
  next();
});

// ---------- Routes ----------
initRoutes(app);
// swagger
setupSwagger(app as any);

// ---------- Global error handler ----------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);

  if (err?.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      result: "fail",
      error: { code: 1001, message: "File is too big" },
    });
    return;
  }

  res.status(500).json({
    result: "fail",
    error: { message: "Internal server error" },
  });
});

export default app;
