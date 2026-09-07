import {NextFunction, Request, Response} from "express";
import { logger } from "../lib/logger.js";


export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    logger.error({err}, "Unhandled error");

    res.status(500).json({
        success: false,
        massage: "Internal server error",
    });
}