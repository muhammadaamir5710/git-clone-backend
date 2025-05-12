import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById((req as any).userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
