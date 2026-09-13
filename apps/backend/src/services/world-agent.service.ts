import { spawn, ChildProcess } from "node:child_process";
import { pool } from "../lib/db.js";
import { createAgentBookVerifier } from "@worldcoin/agentkit";

type RegistrationStatus =
    | "starting"
    | "waiting"
    | "verified"
    | "failed"
    | "timeout";

type RegistrationSession = {
    agentId: string;
    agentAddress: string;
    process: ChildProcess;
    output: string;
    worldUrl: string | null;
    status: RegistrationStatus;
    error: string | null;
    startedAt: number;
};

const sessions = new Map<string, RegistrationSession>();
const REGISTRATION_TIMEOUT = 5 * 60 * 1000;

function extractWorldUrl(output: string): string | null {
    const match = output.match(/https:\/\/world\.org\/verify\?[^\s"'<>]+/i);

    return match?.[0] ?? null;
}

export async function checkAgentHumanBacking(walletAddress: string) {
    const agentBook = createAgentBookVerifier();
    const humanId = await agentBook.lookupHuman(walletAddress);

    return {
        humanBacked: Boolean(humanId),
        humanId: humanId ?? null,
    };
}

export async function startWorldRegistration(agentId: string, agentAddress: string) {
    const existing = sessions.get(agentId);

    if (
        existing && (existing.status === "starting" || existing.status === "waiting")
    ) {
        return {
            status: existing.status,
            worldUrl: existing.worldUrl,
        };
    }

    const child = spawn(
        "pnpm",
        [
            "exec",
            "agentkit",
            "register",
            agentAddress,
            "--auto",
        ],
        {
            cwd: process.cwd(),
            env: process.env,
            stdio: ["ignore", "pipe", "pipe"],
        }
    );

    const session: RegistrationSession = {
        agentId,
        agentAddress,
        process: child,
        output: "",
        worldUrl: null,
        status: "starting",
        error: null,
        startedAt: Date.now(),
    };

    sessions.set(agentId, session);

    const handleOutput = (chunk: Buffer) => {
        const text = chunk.toString();

        session.output += text;

        const worldUrl = extractWorldUrl(session.output);

        if (worldUrl) {
            session.worldUrl = worldUrl;
            session.status = "waiting";
        }
    };

    child.stdout.on("data", handleOutput);
    child.stderr.on("data", handleOutput);

    child.on("error", (error) => {
        session.status = "failed";
        session.error = error.message;
    });

    child.on("close", async (code) => {
        if (session.status === "timeout" || session.status === "failed") {
            return;
        }

        if (code === 0) {
            try {
                const result = await checkAgentHumanBacking(agentAddress);

                if (result.humanBacked) {
                    await updateWorldVerification(agentId, result.humanId!);
                    session.status = "verified";
                    return;
                }

                session.status = "failed";
                session.error = "AgentKit completed but AgentBook registration was not found.";
            } catch (error) {
                session.status = "failed";
                session.error = error instanceof Error ? error.message : "Failed to verify AgentBook registration.";
            }

            return;
        }

        session.status = "failed";
        session.error = `AgentKit registration exited with code ${code}`;
    });

    setTimeout(() => {
        const current = sessions.get(agentId);
        if (!current) return;

        if (current.status === "starting" || current.status === "waiting") {
            current.status = "timeout";
            current.error = "World ID verification timed out.";
            current.process.kill("SIGTERM");
        }
    }, REGISTRATION_TIMEOUT);

    await new Promise((resolve) =>
        setTimeout(resolve, 1000)
    );

    return {
        status: session.status,
        worldUrl: session.worldUrl,
    };
}

export function getWorldRegistrationStatus(agentId: string) {
    const session = sessions.get(agentId);

    if (!session) {
        return null;
    }

    if (!session.worldUrl) {
        session.worldUrl = extractWorldUrl(session.output);
    }

    return {
        status: session.status,
        worldUrl: session.worldUrl,
        error: session.error,
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

