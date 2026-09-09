import { Router } from "express";
import { getMarkets } from "../graph/market-service.js";
import { AppError } from "../errors/AppError.js";

export const marketsRoute = Router();

marketsRoute.get("/markets", async (_req, res, next) => {
    try {
        const data = await getMarkets();
        const markets = data.marketCreateds ?? [];

        if (markets.length === 0) {
            throw new AppError(404, "No markets found");
        }

        return res.json({
            success: true,
            markets,
        });
    } catch (error) {
        next(error);
    }
});
