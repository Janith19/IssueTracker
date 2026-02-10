import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const auth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies["jwt"];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT Secret");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
