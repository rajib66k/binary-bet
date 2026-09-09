import { createPublicClient, http, type Address } from "viem";
import { sepolia } from "viem/chains";
import { env } from "../config/env.js";
import { predictionMarketAbi } from "../abis/constants.js";

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(env.rpcUrl),
});

export async function getTokenIds(market: string) {
    const [conditionId, yesTokenId, noTokenId] = (await publicClient.readContract({
        address: market as Address,
        abi: predictionMarketAbi,
        functionName: "getConditionAndTokenIds",
    })) as [bigint, bigint, bigint];

    return {
        conditionId,
        yesTokenId,
        noTokenId,
    };
}