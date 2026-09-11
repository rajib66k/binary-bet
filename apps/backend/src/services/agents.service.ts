import { AppError } from "../errors/AppError";
import { CreateAgentInput } from "../types/types";
import { createAgent } from "../repositories/agent.repository";

export async function registerAgent(input: CreateAgentInput) {
    if (!input.ownerAddress) {
        throw new AppError(400, "Owner address is required");
    }

    if (!input.name?.trim()) {
        throw new AppError(400, "Agent name is required");
    }

    if (input.maxTradeAmount === undefined || input.maxTradeAmount === null) {
        throw new AppError(400, "Max trade amount is required");
    }

    if (input.maxExposure === undefined || input.maxExposure === null) {
        throw new AppError(400, "Max exposure is required");
    }

    if (input.dailyLossLimit === undefined || input.dailyLossLimit === null) {
        throw new AppError(400, "Daily loss limit is required");
    }

    if (!Array.isArray(input.allowedMarkets)) {
        throw new AppError(400, "Allowed markets must be an array");
    }

    return createAgent(input);
}
