import { Address } from "viem";
import jwt, {SignOptions} from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

export function signAccessToken(address: Address): string {
    const options: SignOptions = {
        expiresIn: env.jwtAccessExpiresIn as SignOptions['expiresIn']
    }

    return jwt.sign(address, env.jwtAccessSecret, options);
}

export function verifyAccessToken(token: string): string {
    try {
        return jwt.verify(token, env.jwtAccessSecret!) as string;
    } catch {
        throw new AppError(401, "Invalid or expired access token")
    }
}