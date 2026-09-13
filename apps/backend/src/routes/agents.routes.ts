import { Router } from "express";
import { getAgentsByOwner } from "../repositories/agent.repository";
import { getAgentById, runTradingAgent } from "../agents/agent-runner";
import { registerAgent } from "../services/agents.service";
import { AuthenticatedRequest, requireAuth } from "../middlewares/auth.middleware";
import { requireAgentOwner } from "../middlewares/agent-owner.middleware";
import { checkAgentHumanBacking, getWorldRegistrationStatus, startWorldRegistration, updateWorldVerification, updateWorldVerificationFailed } from "../services/world-agent.service";
import { requireAgentKit } from "../middlewares/agentkitAuth.js";
import { getAgentPrivateKey } from "../lib/agent-wallet/agent-wallet-service.js";
import { executeTrade } from "../lib/trading/trade-executor.js";
import { pool } from "../lib/db.js";

export const agentsRouter = Router();

agentsRouter.post("/agents", requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
        const {
            name,
            maxTradeAmount,
            maxExposure,
            dailyLossLimit,
            allowedMarkets = [],
        } = req.body;

        const agent = await registerAgent({
            ownerAddress: req.user!.address,
            name,
            maxTradeAmount,
            maxExposure,
            dailyLossLimit,
            allowedMarkets,
        });

        return res.status(201).json({
            success: true,
            message: "Agent created successfully.",
            agent,
        });
    } catch (error) {
        next(error);
    }
}
);

agentsRouter.get("/agents", requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
        const agents = await getAgentsByOwner(req.user!.address);

        return res.json({
            success: true,
            agents,
        });
    } catch (error) {
        next(error);
    }
});

agentsRouter.patch("/agents/:id", requireAuth, requireAgentOwner, async (req: AuthenticatedRequest, res, next) => {
    try {
        const {
            name,
            maxTradeAmount,
            maxExposure,
            dailyLossLimit,
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Agent name is required",
            });
        }

        if (maxTradeAmount === undefined || maxExposure === undefined || dailyLossLimit === undefined) {
            return res.status(400).json({
                success: false,
                message: "All limits are required",
            });
        }

        const result = await pool.query(
            `
                UPDATE ai_agents
                SET
                    name = $1,
                    max_trade_amount = $2,
                    max_exposure = $3,
                    daily_loss_limit = $4,
                    updated_at = NOW()
                WHERE id = $5
                  AND LOWER(owner_address) = LOWER($6)
                RETURNING
                    id,
                    owner_address,
                    name,
                    wallet_address,
                    max_trade_amount,
                    max_exposure,
                    daily_loss_limit,
                    allowed_markets,
                    active,
                    human_backed,
                    registration_status,
                    created_at,
                    updated_at
                `,
            [
                name.trim(),
                maxTradeAmount,
                maxExposure,
                dailyLossLimit,
                req.params.id,
                req.user!.address,
            ]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            });
        }

        return res.json({
            success: true,
            agent: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
});

agentsRouter.post("/agents/:id/run", requireAuth, requireAgentOwner, async (req, res, next) => {
    try {
        const agent = res.locals.agent;

        if (!agent.human_backed) {
            return res.status(403).json({
                success: false,
                message: "Agent is not human backed.",
            });
        }

        if (agent.registration_status !== "verified") {
            return res.status(403).json({
                success: false,
                message: "Agent is not verified."
            });
        }

        const result = await runTradingAgent(agent.id);

        return res.json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
});

agentsRouter.post("/agent-execution/trade", requireAgentKit, async (req, res, next) => {
    try {
        const { agentId, marketAddress, action, outcome, amount } = req.body;
        const verifiedAgent = res.locals.agentkit;
        const agent = await getAgentById(agentId);

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: "Agent not found",
            });
        }

        if (agent.walletAddress.toLowerCase() !== verifiedAgent.agentAddress.toLowerCase()) {
            return res.status(403).json({
                success: false,
                error: "Agent wallet does not match requested agent",
                code: "AGENT_WALLET_MISMATCH",
            });
        }

        if (!agent.active) {
            return res.status(403).json({
                success: false,
                error: "Agent is inactive",
            });
        }

        if (!verifiedAgent.humanId) {
            return res.status(403).json({
                success: false,
                error: "Agent is not human-backed",
                code: "AGENT_NOT_HUMAN_BACKED",
            });
        }

        await updateWorldVerification(agent.id, verifiedAgent.humanId);

        const privateKey = await getAgentPrivateKey(agent.id);

        const transaction = await executeTrade({
            privateKey,
            marketAddress,
            action,
            outcome,
            amount,
        });

        return res.json({
            success: true,
            humanBacked: true,
            agentAddress: verifiedAgent.agentAddress,
            transaction,
        });

    } catch (error) {
        next(error);
    }
});

agentsRouter.post("/agents/:id/world-verification", requireAuth, requireAgentOwner, async (req, res, next) => {
    try {
        const agent = res.locals.agent;

        if (agent.human_backed) {
            return res.json({
                success: true,
                status: "verified",
                humanBacked: true,
                humanId: agent.agentbook_human_id,
            });
        }

        const result = await startWorldRegistration(agent.id, agent.wallet_address);

        return res.json({
            success: true,
            status: result.status,
            worldUrl: result.worldUrl,
        });
    } catch (error) {
        next(error);
    }
});

agentsRouter.get("/agents/:id/world-registration-status", requireAuth, requireAgentOwner, async (req, res, next) => {
    try {
        const agent = res.locals.agent;
        const humanResult = await checkAgentHumanBacking(agent.wallet_address);

        if (humanResult.humanBacked) {
            await updateWorldVerification(agent.id, humanResult.humanId!);

            return res.json({
                success: true,
                status: "verified",
                humanBacked: true,
                humanId: humanResult.humanId,
            });
        }

        const session =
            getWorldRegistrationStatus(agent.id);

        return res.json({
            success: true,
            status: session?.status ?? "not_started",
            humanBacked: false,
            worldUrl: session?.worldUrl ?? null,
            error: session?.error ?? null,
        });
    } catch (error) {
        next(error);
    }
});
