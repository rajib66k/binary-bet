import { z } from "zod";
import { getAgentPrivateKey } from "../lib/agent-wallet/agent-wallet-service.js";
import { createPredictionAgent } from "./prediction-agents.js";
import { validateTrade } from "../lib/trading/risk-engine.js";
import { pool } from "../lib/db.js";
import { AppError } from "../errors/AppError.js";
import { createAgentkitClient } from "@worldcoin/agentkit";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "../config/env.js";

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
            human_backed,
            agentbook_human_id,
            registration_status,
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
        owner: dbAgent.owner_address,
        name: dbAgent.name,
        walletAddress: dbAgent.wallet_address,
        maxTradeAmount: dbAgent.max_trade_amount,
        maxExposure: dbAgent.max_exposure,
        dailyLossLimit: dbAgent.daily_loss_limit,
        allowedMarkets: dbAgent.allowed_markets,
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
    const account = privateKeyToAccount(privateKey);

    const agentkit = createAgentkitClient({
        signer: {
            address: account.address,
            chainId: "eip155:11155111",
            type: "eip191",
            signMessage: async (message) => {
                return account.signMessage({ message });
            },
        },
    });

    const response = await agentkit.fetch(
        `${env.agentExecutionUrl}/api/agent-execution/trade`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                agentId: dbAgent.id,
                marketAddress: decision.marketAddress.toLowerCase(),
                action: decision.action,
                outcome: decision.outcome,
                amount: decision.amount,
            }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new AppError(response.status, `AgentKit trade execution failed: ${errorBody}`);
    }

    const executionResult = await response.json();

    return {
        executed: true,
        decision,
        transaction: executionResult.transaction,
        humanBacked: true,
        agentWallet: account.address,
    };
}
