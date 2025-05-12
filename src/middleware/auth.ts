import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.userId = user._id.toString();
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authenticated" });
  }
};
