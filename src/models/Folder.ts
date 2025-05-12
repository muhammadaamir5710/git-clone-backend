import mongoose, { Document } from "mongoose";

export interface IFolder extends Document {
  _id: string;
  name: string;
  user: mongoose.Schema.Types.ObjectId;
  parent: mongoose.Schema.Types.ObjectId | null;
  createdAt: Date;
}

const folderSchema = new mongoose.Schema<IFolder>({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFolder>("Folder", folderSchema);
