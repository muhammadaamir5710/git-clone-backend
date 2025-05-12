import express from "express";
import {
  createFolder,
  getUserFolders,
  getFolder,
  getFolderContents,
  deleteFolder,
  renameFolder,
  getFolderPath,
} from "../controllers/folderController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

router.post("/", authenticate, asyncHandler(createFolder));
router.get("/", authenticate, asyncHandler(getUserFolders));
router.get("/:id", authenticate, asyncHandler(getFolder));
router.get("/:id/contents", authenticate, asyncHandler(getFolderContents));
router.delete("/:id", authenticate, asyncHandler(deleteFolder));
router.patch("/:id/rename", authenticate, asyncHandler(renameFolder));
router.get("/:id/path", authenticate, asyncHandler(getFolderPath));

export default router;
