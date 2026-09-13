import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { verifyAccessToken } from "../lib/jwt.js";

export interface AuthenticatedRequest
    extends Request {
    user?: { address: string };
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new AppError(401, "Authentication required");
        }

        const token = authorization.substring(7);
        const address = verifyAccessToken(token);

        if (!address) {
            throw new AppError(401, "Invalid authentication token");
        }

        req.user = { address };

        next();
    } catch (error) {
        next(error);
    }
}
