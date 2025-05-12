import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  uploadFile,
  getUserFiles,
  deleteFile,
  renameFile,
} from "../controllers/fileController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

const uploadDir = process.env.UPLOAD_FOLDER || "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  asyncHandler(uploadFile)
);
router.get("/", authenticate, asyncHandler(getUserFiles));
router.delete("/:id", authenticate, asyncHandler(deleteFile));
router.patch("/:id/rename", authenticate, asyncHandler(renameFile));

export default router;
