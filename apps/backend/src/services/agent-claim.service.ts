import { createPublicClient, createWalletClient, erc20Abi, http, type Address } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { pool } from "../lib/db.js";
import { AppError } from "../errors/AppError.js";
import { getAgentPrivateKey } from "../lib/agent-wallet/agent-wallet-service.js";
import { collateralAddress, predictionMarketAbi } from "../abis/constants.js";

const RESOLVED_STATE = 2;

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.RPC_URL!),
});

function validAddress(value: string): value is Address {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export async function claimAgentWinnings(agentId: string, marketAddress: string, ownerAddress: string) {
    if (!validAddress(marketAddress)) {
        throw new AppError(400, "Invalid market address");
    }

    if (!validAddress(ownerAddress)) {
        throw new AppError(400, "Invalid owner address");
    }

    const agentResult = await pool.query(
        `
        SELECT
            id,
            owner_address,
            wallet_address,
            encrypted_private_key
        FROM ai_agents
        WHERE id = $1
        LIMIT 1
        `,
        [agentId],
    );

    const agent = agentResult.rows[0];

    if (!agent) {
        throw new AppError(404, "Agent not found");
    }

    if (agent.owner_address.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new AppError(403, "You do not own this agent");
    }

    const marketState = await publicClient.readContract({
        address: marketAddress,
        abi: predictionMarketAbi,
        functionName: "getMarketState",
    });

    if (Number(marketState) !== RESOLVED_STATE) {
        throw new AppError(400, "Market is not resolved yet");
    }

    const privateKey = await getAgentPrivateKey(agentId);
    const account = privateKeyToAccount(privateKey);

    if (account.address.toLowerCase() !== agent.wallet_address.toLowerCase()) {
        throw new AppError(500, "Agent wallet integrity check failed");
    }

    const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(process.env.RPC_URL!),
    });

    const balanceBefore = await publicClient.readContract({
        address: collateralAddress as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account.address],
    });

    let redeemHash: `0x${string}` | null = null;

    try {
        redeemHash = await walletClient.writeContract({
            address: marketAddress,
            abi: predictionMarketAbi,
            functionName: "redeem",
        });

        await publicClient.waitForTransactionReceipt({
            hash: redeemHash,
        });
    } catch (error) {
        throw new Error(`Failed to redeem winnings for agent ${agentId} on market ${marketAddress}: ${error}`);
    }

    const balanceAfter = await publicClient.readContract({
        address: collateralAddress as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account.address],
    });

    const claimable = balanceAfter > balanceBefore ? balanceAfter - balanceBefore : 0n;

    if (claimable === 0n) {
        throw new AppError(400, "No newly redeemed USDC available to claim");
    }

    const transferHash = await walletClient.writeContract({
        address: collateralAddress as Address,
        abi: erc20Abi,
        functionName: "transfer",
        args: [ownerAddress as Address, claimable],
    });

    await publicClient.waitForTransactionReceipt({
        hash: transferHash,
    });

    return {
        claimed: true,
        amount: claimable.toString(),
        agentWallet: account.address,
        ownerWallet: ownerAddress,
        marketAddress,
        redeemTransaction: redeemHash,
        claimTransaction: transferHash,
    };
}