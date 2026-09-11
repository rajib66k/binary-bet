import { createAgentBookVerifier, declareAgentkitExtension, parseAgentkitHeader, validateAgentkitMessage, verifyAgentkitSignature } from "@worldcoin/agentkit";

const AGENT_CHAIN = "eip155:11155111";

const agentBook = createAgentBookVerifier();

export function createAgentkitChallenge(req: {
    protocol: string;
    host: string;
    originalUrl: string;
}) {
    const protocol = req.protocol;
    const host = req.host;
    const resourceUri = `${protocol}://${host}${req.originalUrl}`;

    return declareAgentkitExtension({
        domain: host,
        resourceUri,
        network: AGENT_CHAIN,
        statement: "Verify this AI trading agent is backed by a real human",
        expirationSeconds: 300,
    });
}

export async function verifyAgentkitRequest(header: string, resourceUri: string) {
    let payload;

    try {
        payload = parseAgentkitHeader(header);
    } catch {
        return {
            valid: false,
            reason: "Invalid AgentKit header",
        };
    }

    const validation = await validateAgentkitMessage(payload, resourceUri);

    if (!validation.valid) {
        return {
            valid: false,
            reason: validation.error ?? "Invalid AgentKit message",
        };
    }

    const verification = await verifyAgentkitSignature(payload);

    if (!verification.valid || !verification.address) {
        return {
            valid: false,
            reason: verification.error ?? "AgentKit signature verification failed",
        };
    }

    const humanId = await agentBook.lookupHuman(verification.address);

    if (!humanId) {
        return {
            valid: false,
            reason: "Agent is not registered in AgentBook",
        };
    }

    return {
        valid: true,
        agentAddress: verification.address,
        humanId,
    };
}
