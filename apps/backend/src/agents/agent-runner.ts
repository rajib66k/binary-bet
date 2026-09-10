import { z } from "zod";
import { getAgentPrivateKey } from "../lib/agent-wallet/agent-wallet-service.js";
import { createPredictionAgent } from "./prediction-agents.js";
import { validateTrade } from "../lib/trading/risk-engine.js";
import { executeTrade } from "../lib/trading/trade-executor.js";
import { pool } from "../lib/db.js";
import { AppError } from "../errors/AppError.js";

async function getTradingDecision(agent: any) {
    return await agent.generate(
        "Analyze the available prediction markets and determine whether there is a good trading opportunity.",
        {
            structuredOutput: {
                schema: z.object({
                    action: z.enum(["BUY", "SELL", "HOLD"]),
                    marketAddress: z.string(),
                    outcome: z.enum(["YES", "NO"]).nullable(),
                    amount: z.number().nonnegative(),
                    confidence: z.number().min(0).max(1),
                    reason: z.string(),
                    requiresHumanApproval: z.boolean(),
                }),
            },
        },
    );
}

export async function getAgentById(agentId: string) {
    const result = await pool.query(
        `
        SELECT
            id,
            owner_address,
            name,
            wallet_address,
            encrypted_private_key,
            max_trade_amount,
            max_exposure,
            daily_loss_limit,
            allowed_markets,
            active,
            created_at,
            updated_at
        FROM ai_agents
        WHERE id = $1
        LIMIT 1
        `,
        [agentId]
    );

    return result.rows[0] ?? null;
}

export async function runTradingAgent(agentId: string) {
    const dbAgent = await getAgentById(agentId);

    if (!dbAgent) {
        throw new AppError(404, "Agent not found");
    }

    if (!dbAgent.active) {
        return {
            executed: false,
            reason: "Agent is paused",
        };
    }

    const agentConfig = {
        id: dbAgent.id,
        owner: dbAgent.ownerAddress,
        name: dbAgent.name,
        walletAddress: dbAgent.walletAddress,
        maxTradeAmount: dbAgent.maxTradeAmount,
        maxExposure: dbAgent.maxExposure,
        dailyLossLimit: dbAgent.dailyLossLimit,
        allowedMarkets: dbAgent.allowedMarkets,
    }

    const agent = createPredictionAgent(agentConfig);
    const decision = await getTradingDecision(agent);
    const risk = validateTrade(agentConfig, decision);

    if (!risk.allowed) {
        return {
            executed: false,
            decision,
            reason: risk.reason,
        };
    }

    const privateKey = await getAgentPrivateKey(agentId);
    const market = decision.marketAddress.toLowerCase();

    const tx = await executeTrade({
        privateKey,
        marketAddress: market!,
        action: decision.action,
        outcome: decision.outcome!,
        amount: decision.amount,
    });

    return {
        executed: true,
        decision,
        transaction: tx,
    };
}
