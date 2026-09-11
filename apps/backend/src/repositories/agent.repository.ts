import { pool } from "../lib/db";
import { encryptPrivateKey } from "../lib/agent-wallet/wallet-encryption";
import { CreateAgentInput } from "../types/types";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export async function createAgent(input: CreateAgentInput) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);

    console.log(privateKey);
    console.log(account.address);

    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    const normalizeAddress = input.ownerAddress.toLowerCase().trim();

    const result = await pool.query(
        `
        INSERT INTO ai_agents (
            owner_address,
            name,
            wallet_address,
            encrypted_private_key,
            max_trade_amount,
            max_exposure,
            daily_loss_limit,
            allowed_markets,
            human_backed,
            registration_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, 'pending')
        RETURNING
            owner_address,
            name,
            wallet_address,
            max_trade_amount,
            max_exposure,
            daily_loss_limit,
            allowed_markets,
            active,
            created_at
        `,
        [
            normalizeAddress,
            input.name,
            account.address,
            encryptedPrivateKey,
            input.maxTradeAmount,
            input.maxExposure,
            input.dailyLossLimit,
            input.allowedMarkets,
        ]
    );

    return result.rows[0];
}

export async function getAgentsByOwner(ownerAddress: string) {
    const result = await pool.query(
        `
        SELECT
            id,
            owner_address,
            name,
            wallet_address,
            max_trade_amount,
            max_exposure,
            daily_loss_limit,
            allowed_markets,
            active,
            created_at,
            updated_at
        FROM ai_agents
        WHERE LOWER(owner_address) = LOWER($1)
        ORDER BY created_at DESC
        `,
        [ownerAddress]
    );

    return result.rows;
}