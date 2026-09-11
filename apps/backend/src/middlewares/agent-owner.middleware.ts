import { Response, NextFunction } from "express";
import { pool } from "../lib/db";
import { AppError } from "../errors/AppError";
import { AuthenticatedRequest } from "./auth.middleware";

export async function requireAgentOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const agentId = req.params.id;
        const userAddress = req.user?.address;

        if (!userAddress) {
            throw new AppError(401, "Authentication required");
        }

        const result = await pool.query(
            `
            SELECT *
            FROM ai_agents
            WHERE id = $1
              AND LOWER(owner_address) = LOWER($2)
            `,
            [agentId, userAddress]
        );

        if (result.rows.length === 0) {
            throw new AppError(404, "Agent not found");
        }

        res.locals.agent = result.rows[0];

        next();
    } catch (error) {
        next(error);
    }
}