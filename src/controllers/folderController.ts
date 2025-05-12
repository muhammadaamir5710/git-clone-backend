import { Request, Response } from "express";
import Folder from "../models/Folder";
import File from "../models/File";
import fs from "fs";
import { Types } from "mongoose";

export const createFolder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, parentId } = req.body;

    const folder = new Folder({
      name,
      user: new Types.ObjectId((req as any).userId),
      parent: parentId ? new Types.ObjectId(parentId) : null,
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserFolders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { parentId } = req.query;
    const query: any = { user: new Types.ObjectId((req as any).userId) };

    if (parentId) {
      query.parent = new Types.ObjectId(parentId as string);
    } else {
      query.parent = null;
    }

    const folders = await Folder.find(query).sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const folder = await Folder.findOne({
      _id: new Types.ObjectId(req.params.id),
      user: new Types.ObjectId((req as any).userId),
    });

    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    res.json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFolderContents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const folder = await Folder.findOne({
      _id: new Types.ObjectId(req.params.id),
      user: new Types.ObjectId((req as any).userId),
    });

    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    const folders = await Folder.find({ parent: folder._id });
    const files = await File.find({ folder: folder._id });
    res.json({ folders, files });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteFolder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const folder = await Folder.findOne({
      _id: new Types.ObjectId(req.params.id),
      user: new Types.ObjectId((req as any).userId),
    });

    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    const deleteFolderContents = async (folderId: string) => {
      const subfolders = await Folder.find({ parent: folderId });

      for (const subfolder of subfolders) {
        await deleteFolderContents(subfolder._id.toString());
      }

      const files = await File.find({ folder: folderId });
      for (const file of files) {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        await file.deleteOne();
      }

      await Folder.deleteOne({ _id: folderId });
    };

    await deleteFolderContents(folder._id.toString());
    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const renameFolder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;
    const folder = await Folder.findOneAndUpdate(
      {
        _id: new Types.ObjectId(req.params.id),
        user: new Types.ObjectId((req as any).userId),
      },
      { name },
      { new: true }
    );

    if (!folder) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    res.json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFolderPath = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const folderId: any = new Types.ObjectId(req.params.id);
    const path: any = [];
    let currentId = folderId;

    while (currentId) {
      const folder = await Folder.findOne({ _id: currentId });
      if (!folder) break;

      path.unshift({
        _id: folder._id.toString(),
        name: folder.name,
        createdAt: folder.createdAt,
      });

      currentId = folder.parent;
    }

    res.json(path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
