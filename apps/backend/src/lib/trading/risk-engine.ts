import type { AgentConfig } from "../../types/types.js";

export function validateTrade(agent: AgentConfig, decision: any) {
    if (decision.action === "HOLD") {
        return {
            allowed: false,
            reason: "AI decided to HOLD",
        };
    }

    if (!decision.marketAddress) {
        return {
            allowed: false,
            reason: "Missing market address",
        };
    }

    if (!decision.outcome) {
        return {
            allowed: false,
            reason: "Missing outcome",
        };
    }

    if (decision.amount <= 0) {
        return {
            allowed: false,
            reason: "Trade amount must be greater than zero",
        };
    }

    if (decision.amount > agent.maxTradeAmount) {
        return {
            allowed: false,
            reason: `Trade amount ${decision.amount} exceeds max trade ${agent.maxTradeAmount}`,
        };
    }

    if (agent.allowedMarkets && agent.allowedMarkets.length > 0) {
        const allowed = agent.allowedMarkets.some(
            (market) => market.toLowerCase() === decision.marketAddress!.toLowerCase()
        );

        if (!allowed) {
            return {
                allowed: false,
                reason: "Market is not allowed for this agent",
            };
        }
    }

    return {
        allowed: true,
        reason: "Trade passed risk checks",
    };
}
