import type { Request, Response, NextFunction } from "express";
import {createAgentkitChallenge, verifyAgentkitRequest} from "../services/agentkit.service.js";

export async function requireAgentKit(req: Request, res: Response, next: NextFunction) {
    try {
        const header = req.header("agentkit");

        if (!header) {
            const extension = createAgentkitChallenge(req);

            return res.status(402).json({
                x402Version: 1,
                error: "AgentKit authentication required",
                extensions: {
                    agentkit: extension,
                },
            });
        }

        const resourceUri = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

        const result = await verifyAgentkitRequest(header, resourceUri);

        if (!result.valid) {
            return res.status(403).json({
                success: false,
                error: result.reason,
                code: "AGENTKIT_VERIFICATION_FAILED",
            });
        }

        res.locals.agentkit = {
            agentAddress: result.agentAddress,
            humanId: result.humanId,
        };

        next();
    } catch (error) {
        next(error);
    }
}
