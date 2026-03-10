import path from "path";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import { Request, Response, NextFunction } from "express";
import root from "../root";

// ---------- Extend Express Request ----------

declare global {
  namespace Express {
    interface Request {
      fileValidationError?: string;
    }
  }
}

// ---------- Storage ----------

const storage: StorageEngine = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(root, "uploads"));
  },

  filename(req, file, cb) {
    const filename =
      new Date().toISOString().replace(/:/g, "-") +
      "-" +
      file.originalname;

    cb(null, filename);
  },
});

// ---------- Validation Middleware ----------

 const validateFileSizes = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (request.fileValidationError) {
    response.status(400).json({ error: request.fileValidationError });
    return;
  }

  if (request.file) {
    if (request.file.size > 1.5 * 1024 * 1024) {
      response
        .status(400)
        .json({ error: "File is too large. Max file size is 1.5MB" });
      return;
    }
  }

  if (request.files && !Array.isArray(request.files)) {
    const images = request.files["images"] as Express.Multer.File[] | undefined;

    if (images) {
      const invalid = images.some(
        (file) => file.size > 1.5 * 1024 * 1024
      );

      if (invalid) {
        response.status(400).json({
          error: "One or more files are too large. Max file size is 1.5MB",
        });
        return;
      }
    }

    const smallScreenImage = request.files[
      "smallScreenImageUrl"
    ] as Express.Multer.File[] | undefined;

    if (smallScreenImage && smallScreenImage[0] && smallScreenImage[0].size > 2.5 * 1024 * 1024) {
      response
        .status(400)
        .json({ error: "File is too large. Max file size is 2.5MB" });
      return;
    }

    const largeScreenImage = request.files[
      "largeScreenImageUrl"
    ] as Express.Multer.File[] | undefined;

    if (largeScreenImage && largeScreenImage[0] && largeScreenImage[0].size > 2.5 * 1024 * 1024) {
      response
        .status(400)
        .json({ error: "File is too large. Max file size is 2.5MB" });
      return;
    }
  }

  next();
};

// ---------- Upload Handlers ----------

 const upload = multer({
  storage,
}).single("file");

 const uploadMultiple = multer({
  storage,
  fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    const allowedTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/webp",
      "video/mp4",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileValidationError =
        "Only .png, .jpg, .jpeg, .webp and .mp4 formats are allowed!";
      cb(null, false);
    }
  },
});

 const uploadPDFandImages = multer({
  storage,
  fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    const allowedTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/webp",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.fileValidationError =
        "Only .png, .jpg, .jpeg, .webp and .pdf formats are allowed!";
      cb(null, false);
    }
  },
}).single("file");


export { upload, uploadMultiple, uploadPDFandImages, validateFileSizes };