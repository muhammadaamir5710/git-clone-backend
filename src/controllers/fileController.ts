import { Request, Response } from "express";
import File from "../models/File";
import { Types } from "mongoose";
import fs from "fs";

export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const { folderId } = req.body;
    const file = new File({
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
      user: new Types.ObjectId((req as any).userId),
      folder: folderId ? new Types.ObjectId(folderId) : null,
    });

    await file.save();
    res.status(201).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserFiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.query;
    const query: any = { user: new Types.ObjectId((req as any).userId) };

    if (folderId) {
      query.folder = new Types.ObjectId(folderId as string);
    } else {
      query.folder = null;
    }

    const files = await File.find(query).sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const file = await File.findOne({
      _id: new Types.ObjectId(req.params.id),
      user: new Types.ObjectId((req as any).userId),
    });

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    await file.deleteOne();
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const renameFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    const file = await File.findOneAndUpdate(
      {
        _id: new Types.ObjectId(req.params.id),
        user: new Types.ObjectId((req as any).userId),
      },
      { name },
      { new: true }
    );

    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
