import path from "path";
import { Request, Response } from "express";
import { ENV } from "../config/env.config";
import root from "../root";


export const getHome = (_req: Request, res: Response): void => {
  const filePath = path.join(root, "views", "index.html");

  res.sendFile(filePath, {
    headers: {
      "Content-Type": "text/html",
      "X-Env": ENV,
    },
  });
};
