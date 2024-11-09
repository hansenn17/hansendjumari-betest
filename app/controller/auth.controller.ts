import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const generateToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = jwt.sign(
      { id: uuidv4() },
      process.env.JWT_ACCESS_SECRET_KEY || "secret-key",
      {
        expiresIn: "1h",
      }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Error generating token" });
  }
};
