import { Address } from "viem";
import jwt, {SignOptions} from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

export function signAccessToken(address: Address): string {
    const options: SignOptions = {
        expiresIn: env.jwtAccessExpiresIn as SignOptions['expiresIn']
    }

    return jwt.sign({ address }, env.jwtAccessSecret, options);
}

export function verifyAccessToken(token: string): string {
    try {
        const payload = jwt.verify(token, env.jwtAccessSecret!);

        if (
            typeof payload !== "object" ||
            payload === null ||
            typeof payload.address !== "string"
        ) {
            throw new AppError(401, "Invalid authentication token");
        }

        return payload.address;
    } catch {
        throw new AppError(401, "Invalid or expired access token")
    }
}