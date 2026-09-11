import { Router } from "express";
import { getAgentsByOwner } from "../repositories/agent.repository";
import { getAgentById, runTradingAgent } from "../agents/agent-runner";
import { registerAgent } from "../services/agents.service";
import { AuthenticatedRequest, requireAuth } from "../middlewares/auth.middleware";
import { requireAgentOwner } from "../middlewares/agent-owner.middleware";
import { checkAgentHumanBacking, updateWorldVerification, updateWorldVerificationFailed } from "../services/world-agent.service";
import { AppError } from "../errors/AppError";
import { requireAgentKit } from "../middlewares/agentkitAuth.js";
import { getAgentPrivateKey } from "../lib/agent-wallet/agent-wallet-service.js";
import { executeTrade } from "../lib/trading/trade-executor.js";

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

        const result = await runTradingAgent({
            ...req.body,
            agentId: agent.id,
        });

        return res.json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
});

agentsRouter.get("/agents/:id/world-status", requireAuth, requireAgentOwner, async (req, res, next) => {
    try {
        const agent = await getAgentById(req.params.id as string);

        if (!agent) {
            throw new AppError(404, "Agent not found");
        }

        const result = await checkAgentHumanBacking(agent.walletAddress);

        if (result.humanBacked) {
            await updateWorldVerification(agent.id, result.humanId!);
        } else {
            await updateWorldVerificationFailed(agent.id);
        }

        return res.json({
            success: true,
            humanBacked: result.humanBacked,
            registrationStatus: result.humanBacked ? "verified" : "pending",
        });
    } catch (error) {
        next(error);
    }
}
);

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
