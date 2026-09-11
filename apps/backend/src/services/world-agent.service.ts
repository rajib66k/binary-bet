import { createAgentBookVerifier } from "@worldcoin/agentkit";
import { pool } from "../lib/db";

const agentBook = createAgentBookVerifier();

export async function checkAgentHumanBacking(walletAddress: string) {
    const humanId = await agentBook.lookupHuman(walletAddress);

    return {
        humanBacked: Boolean(humanId),
        humanId: humanId ?? null,
    };
}

export async function updateWorldVerification(agentId: string, humanId: string) {
    const result = await pool.query(
        `
        UPDATE ai_agents
        SET
            human_backed = TRUE,
            agentbook_human_id = $2,
            agentbook_registered_at = NOW(),
            registration_status = 'verified',
            updated_at = NOW()
        WHERE id = $1
        RETURNING
            id,
            human_backed AS "humanBacked",
            agentbook_registered_at AS "agentbookRegisteredAt",
            registration_status AS "registrationStatus"
        `,
        [agentId, humanId]
    );

    return result.rows[0] ?? null;
}

export async function updateWorldVerificationFailed(agentId: string) {
    await pool.query(
        `
        UPDATE ai_agents
        SET
            human_backed = FALSE,
            registration_status = 'pending',
            updated_at = NOW()
        WHERE id = $1
        `,
        [agentId]
    );
}

