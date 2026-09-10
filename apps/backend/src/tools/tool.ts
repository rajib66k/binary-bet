import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getMarketDetails, getMarkets } from "../graph/market-service";

export const getMarketDetailsTool = createTool({
    id: "get_market_details",
    description: "Get detailed onchain data for a prediction market, including market information, token IDs, trading statistics, and liquidity events.",

    inputSchema: z.object({
        market: z.string()
    }),

    outputSchema: z.object({
        exists: z.boolean(),
        active: z.boolean(),

        market: z
            .object({
                market: z.string(),
                questionId: z.string(),
                createdAt: z.string(),
            })
            .nullable(),

        yes: z.object({
            buys: z.number(),
            sells: z.number(),
            buyVolume: z.string(),
            sellVolume: z.string(),
            netVolume: z.string(),
        }).nullable(),

        no: z.object({
            buys: z.number(),
            sells: z.number(),
            buyVolume: z.string(),
            sellVolume: z.string(),
            netVolume: z.string(),
        }).nullable(),
    }),

    execute: async ({ market }) => {
        return await getMarketDetails(market);
    },
});

export const getMarketsTool = createTool({
    id: "get_markets",
    description: "Get allowed prediction markets",

    outputSchema: z.object({
        marketCreateds: z.array(
            z.object({
                market: z.string(),
                questionId: z.string(),
                lpToken: z.string(),
                blockTimestamp: z.string(),
            })
        ),
    }),

    execute: async () => {
        return await getMarkets();
    },
});