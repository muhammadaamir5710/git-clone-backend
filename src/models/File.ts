import mongoose, { Document } from "mongoose";

export interface IFile extends Document {
  name: string;
  path: string;
  size: number;
  type: string;
  user: mongoose.Schema.Types.ObjectId;
  folder: mongoose.Schema.Types.ObjectId | null;
  createdAt: Date;
}

const fileSchema = new mongoose.Schema<IFile>({
  name: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFile>("File", fileSchema);
