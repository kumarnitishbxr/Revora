import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken, JwtUserPayload } from "../utils/jwt";

export interface AuthenticatedUser {
  id: number;
  role: Role;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // Check HTTP-only cookie first, then fallback to Authorization Bearer header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token missing",
        errors: [],
      });
      return;
    }

    const decoded: JwtUserPayload = verifyToken(token);
    req.user = {
      id: parseInt(decoded.sub, 10),
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
      errors: [],
    });
  }
};
