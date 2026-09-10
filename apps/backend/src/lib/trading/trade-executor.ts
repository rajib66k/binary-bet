import { createWalletClient, erc20Abi, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { parseUnits } from "viem";
import { collateralAddress, predictionMarketAbi } from "../../abis/constants.js";
import { sepolia } from 'viem/chains';
import { ExecuteTradeParams } from "../../types/types.js";

export async function executeTrade({ privateKey, marketAddress, action, outcome, amount }: ExecuteTradeParams) {
    const account = privateKeyToAccount(privateKey);

    const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(process.env.RPC_URL!),
    });

    const contractAddress = marketAddress as Address;
    const collateralAmount = parseUnits(amount.toString(), 6);

    let functionName: | "buyYes" | "buyNo" | "sellYes" | "sellNo";

    if (action === "BUY" && outcome === "YES") {
        functionName = "buyYes";
    } else if (action === "BUY" && outcome === "NO") {
        functionName = "buyNo";
    } else if (action === "SELL" && outcome === "YES") {
        functionName = "sellYes";
    } else {
        functionName = "sellNo";
    }

    await walletClient.writeContract({
        address: collateralAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddress, collateralAmount]
    });


    const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: predictionMarketAbi,
        functionName: functionName,
        args: action === "BUY" ? [collateralAmount, 0n,] : [collateralAmount, 2n ** 256n - 1n],
    });

    return {
        hash,
        agentWallet: account.address,
        marketAddress,
        functionName,
    };
}
