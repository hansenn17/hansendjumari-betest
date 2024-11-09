import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token: string | undefined = req
      .header("Authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded: string | jwt.JwtPayload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET_KEY || "secret-key"
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "you are not authorized" });
  }
};
