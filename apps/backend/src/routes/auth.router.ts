import { Router } from "express";
import { createAuthNonce, authenticateWallet } from "../services/auth.service";
import { AppError } from "../errors/AppError";

export const authRouter = Router();

authRouter.get("/auth/nonce", async (req, res, next) => {
    try {
        const address = String(req.query.address || "");

        if (!address) {
            throw new AppError(400, "Wallet address is required");
        }

        const result = await createAuthNonce(address);

        return res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
});

authRouter.post("/auth/verify", async (req, res, next) => {
    try {
        const { address, signature } = req.body;

        if (!address || !signature) {
            throw new AppError(400, "Address and signature are required");
        }

        const { accessToken } = await authenticateWallet(address, signature);

        return res.json({
            success: true,
            address: address,
            accessToken,
        });
    } catch (error) {
        next(error);
    }
});