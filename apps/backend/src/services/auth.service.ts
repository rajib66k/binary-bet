import { randomBytes } from "node:crypto";
import { Address, verifyMessage } from "viem";
import { pool } from "../lib/db.js";
import { AppError } from "../errors/AppError.js";
import { signAccessToken } from "../lib/jwt.js";

function normalizeAddress(address: string) {
    return address.toLowerCase().trim() as Address;
}

export function buildAuthMessage(address: Address, nonce: string) {
    return `AI Trading Agent

Sign this message to authenticate with the application.

Wallet: ${address}
Nonce: ${nonce}

This signature does not authorize any blockchain transaction.`;
}

export async function createAuthNonce(address: string) {
    const normalizedAddress = normalizeAddress(address);
    const nonce = randomBytes(32).toString('hex');

    await pool.query(
        `
        INSERT INTO auth_nonces (
            address,
            nonce,
            expires_at,
            used
        )
        VALUES (
            $1,
            $2,
            NOW() + INTERVAL '5 minutes',
            FALSE
        )
        ON CONFLICT (address)
        DO UPDATE SET
            nonce = EXCLUDED.nonce,
            expires_at = EXCLUDED.expires_at,
            used = FALSE
        `,
        [normalizedAddress, nonce]
    );

    return {
        address: normalizedAddress,
        nonce,
    };
}

export async function authenticateWallet(
    address: Address,
    signature: `0x${string}`
): Promise<{ accessToken: string }> {
    const normalizedAddress = normalizeAddress(address);

    const result = await pool.query(
        `
        SELECT
            nonce,
            expires_at,
            used
        FROM auth_nonces
        WHERE address = $1
        `,
        [normalizedAddress]
    );

    if (result.rows.length === 0) {
        throw new AppError(401, "Authentication nonce not found");
    }

    const { nonce, expires_at, used } = result.rows[0];

    if (used) {
        throw new AppError(401, "Authentication nonce already used");
    }

    if (new Date(expires_at).getTime() < Date.now()) {
        throw new AppError(401, "Authentication nonce expired");
    }

    const message = buildAuthMessage(normalizedAddress, nonce);

    const valid = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature
    });

    if (!valid) {
        throw new AppError(401, "Invalid wallet signature");
    }

    await pool.query(
        `
        UPDATE auth_nonces
        SET used = TRUE
        WHERE address = $1
        `,
        [normalizedAddress]
    );

    const accessToken = signAccessToken(normalizedAddress);

    return { accessToken };
}