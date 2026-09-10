import { getAgentById } from "../../agents/agent-runner.js";
import { decryptPrivateKey } from "./wallet-encryption.js";

export async function getAgentPrivateKey(agentId: string): Promise<`0x${string}`> {
    const agent = await getAgentById(agentId);

    if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
    }

    if (!agent.encryptedPrivateKey) {
        throw new Error(`Agent ${agentId} has no wallet`);
    }

    const privateKey = decryptPrivateKey(agent.encryptedPrivateKey);

    return privateKey as `0x${string}`;
}
