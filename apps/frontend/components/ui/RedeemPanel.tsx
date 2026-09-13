"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useConfig, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt, } from "wagmi/actions";
import { erc1155Abi, formatUnits } from "viem";
import { predictionMarketAbi } from "../../constants";

type RedeemPanelProps = {
    market: string;
    question: string;
};

const SEPOLIA_CHAIN_ID = 11155111;
const RESOLVED_STATE = 2;

function isValidAddress(value: string): value is `0x${string}` {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function getTokenImage(question: string): string | null {
    const q = question.toUpperCase();

    if (q.includes("BTC") || q.includes("BITCOIN")) {
        return "/tokens/btc.svg";
    }

    if (q.includes("ETH") || q.includes("ETHEREUM")) {
        return "/tokens/eth.svg";
    }

    return null;
}

export function RedeemPanel({ market, question }: RedeemPanelProps) {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const config = useConfig();
    const { writeContractAsync } = useWriteContract();
    const [yesBalance, setYesBalance] = useState<bigint>(0n);
    const [noBalance, setNoBalance] = useState<bigint>(0n);
    const [marketState, setMarketState] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [txHash, setTxHash] = useState("");
    const marketAddress = isValidAddress(market) ? market : null;
    const tokenImage = getTokenImage(question);

    async function loadRedeemData() {
        if (!address || !marketAddress) {
            return;
        }

        try {
            setLoading(true);
            setError("");

            const state = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getMarketState",
            });

            setMarketState(Number(state));


            const result = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getConditionAndTokenIds",
            }) as [bigint, bigint, bigint];

            const yesId = result[1];
            const noId = result[2];

            const tokenAddress = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getConditionalToken",
            });

            const conditionalAddress = tokenAddress as `0x${string}`;

            const [yes, no] = await Promise.all([
                readContract(config, {
                    address: conditionalAddress,
                    abi: erc1155Abi,
                    functionName: "balanceOf",
                    args: [address, yesId]
                }),

                readContract(config, {
                    address: conditionalAddress,
                    abi: erc1155Abi,
                    functionName: "balanceOf",
                    args: [address, noId]
                }),
            ]);

            setYesBalance(yes);
            setNoBalance(no);
        } catch (err) {
            setError("Failed to load redemption information.",);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isConnected && address && chainId === SEPOLIA_CHAIN_ID && marketAddress) {
            void loadRedeemData();
        }
    }, [address, isConnected, chainId, market]);

    async function handleRedeem() {
        setError("");
        setStatus("");
        setTxHash("");

        try {
            if (!isConnected || !address) {
                throw new Error("Please connect your wallet first.");
            }

            if (chainId !== SEPOLIA_CHAIN_ID) {
                throw new Error("Please switch your wallet to Sepolia.",);
            }

            if (!marketAddress) {
                throw new Error("Invalid market address.");
            }

            setStatus("Checking market status");

            const state = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getMarketState",
            });

            if (Number(state) !== RESOLVED_STATE) {
                throw new Error("This market has not been resolved yet.");
            }

            setStatus("Checking your positions");

            const result = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getConditionAndTokenIds",
            }) as [bigint, bigint, bigint];

            const yesId = result[1];
            const noId = result[2];

            const tokenAddress = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getConditionalToken",
            });

            const conditionalAddress = tokenAddress as `0x${string}`;

            const [yes, no] = await Promise.all([
                readContract(config, {
                    address: conditionalAddress,
                    abi: erc1155Abi,
                    functionName: "balanceOf",
                    args: [address, yesId]
                }),

                readContract(config, {
                    address: conditionalAddress,
                    abi: erc1155Abi,
                    functionName: "balanceOf",
                    args: [address, noId]
                }),
            ]);

            setYesBalance(yes);
            setNoBalance(no);

            if (yes === 0n && no === 0n) {
                throw new Error("You have no YES or NO tokens to redeem.");
            }

            setStatus("Confirm redemption in your wallet");

            const hash = await writeContractAsync({
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "redeem",
            });

            setTxHash(hash);
            setStatus("Waiting for transaction confirmation");

            await waitForTransactionReceipt(
                config,
                {
                    hash,
                },
            );

            setStatus("Position redeemed successfully!");

            await loadRedeemData();
        } catch (err: any) {
            const message = err?.shortMessage || err?.cause?.shortMessage || err?.message || "Redemption failed.";
            setError(message);
            setStatus("");
        }
    }

    const isResolved = marketState === RESOLVED_STATE;

    const hasPosition = yesBalance > 0n || noBalance > 0n;

    const redeemDisabled = !isConnected || chainId !== SEPOLIA_CHAIN_ID || !marketAddress
        || loading || redeeming || !isResolved || !hasPosition;


    return (
        <section className="w-full max-w-md rounded-3xl border border-[#03a9f4]/20 bg-white p-5 shadow-lg shadow-[#03a9f4]/5 sm:p-7">
            <div className="flex items-center justify-between">

                {tokenImage ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#03a9f4]/20 bg-[#03a9f4]/5 shadow-sm">
                        <img src={tokenImage} alt="Market token" className="h-11 w-11" />
                    </div>
                ) : null}

                <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#03a9f4]/40 hover:bg-[#03a9f4]/5 hover:text-[#03a9f4]">
                    Markets
                </Link>
            </div>

            <h1 className="mt-7 text-xl font-semibold leading-snug text-gray-900">{question}</h1>


            <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3">

                <div className="flex items-center justify-between">

                    <span className="text-sm text-gray-500">Market status</span>
                    <span className={`font-semibold ${isResolved ? "text-green-600" : "text-gray-700"}`}>
                        {marketState === null ? "Loading..." : marketState === 0 ? "Pending" : marketState === 1 ? "Open" : marketState === 2 ? "Resolved" : "Cancelled"}
                    </span>
                </div>
            </div>

            {!isConnected && (
                <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
                    Connect your wallet to redeem your position.
                </div>
            )}

            {isConnected &&
                chainId !== SEPOLIA_CHAIN_ID && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">Please switch your wallet to Sepolia</div>
                )}

            <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="text-sm text-gray-500">YES</div>
                    <div className="mt-2 text-xl font-semibold text-gray-800">{loading ? "Loading..." : `${formatUnits(yesBalance, 6,)} YES`}</div>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="text-sm text-gray-500">NO</div>
                    <div className="mt-2 text-xl font-semibold text-gray-800">{loading ? "Loading..." : `${formatUnits(noBalance, 6)} NO`}</div>
                </div>
            </div>


            {!loading && marketState !== null && !isResolved && (
                <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                    Redemption will be available after this market is resolved.
                </div>
            )}

            {!loading && isResolved && !hasPosition && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    You don't have any YES or NO position to redeem.
                </div>
            )}

            {isResolved &&
                hasPosition && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

                        <div className="text-sm font-medium text-green-700">Market resolved</div>

                        <p className="mt-1 text-sm text-green-600">Your eligible prediction position can now be redeemed.</p>

                        <div className="mt-3 space-y-2 text-sm">

                            <div className="flex justify-between">
                                <span className="text-gray-500">YES position</span>
                                <span className="font-medium text-gray-700">{formatUnits(yesBalance, 6)}{" "}YES</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">NO position</span>
                                <span className="font-medium text-gray-700">{formatUnits(noBalance, 6)}{" "}NO</span>
                            </div>
                        </div>
                    </div>
                )}

            <button type="button" onClick={() => { setRedeeming(true); void handleRedeem().finally(() => { setRedeeming(false); }); }}
                disabled={redeemDisabled}
                className="mt-5 w-full rounded-xl bg-[#03a9f4] px-4 py-3.5 font-semibold text-white transition-colors hover:bg-[#0290d3] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {redeeming ? "Redeeming..." : "Redeem position"}
            </button>

            {status && (
                <div className="mt-4 rounded-xl border border-[#03a9f4]/20 bg-[#03a9f4]/5 p-3 text-sm text-[#0288c7]">{status}</div>
            )}

            {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            {txHash && (
                <div className="mt-4">
                    <Link href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#03a9f4] underline">
                        View transaction on Etherscan
                    </Link>
                </div>
            )}
        </section>
    );
}