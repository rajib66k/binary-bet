"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useConfig, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { erc1155Abi, erc20Abi, formatUnits, parseUnits } from "viem";
import { collateralAddress, predictionMarketAbi } from "../../constants";

type TradePanelProps = {
    market: string;
    question: string;
    outcome: "yes" | "no";
};

const SEPOLIA_CHAIN_ID = 11155111;

function getTokenImage(question: string): string | null {
    const upperQuestion = question.toUpperCase();

    if (upperQuestion.includes("BTC") || upperQuestion.includes("BITCOIN")) {
        return "/tokens/btc.svg";
    }

    if (upperQuestion.includes("ETH") || upperQuestion.includes("ETHEREUM")) {
        return "/tokens/eth.svg";
    }

    return null;
}

function isValidAddress(value: string): value is `0x${string}` {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function TradePanel({ market, question, outcome }: TradePanelProps) {
    const tokenImage = getTokenImage(question);

    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const config = useConfig();
    const { writeContractAsync } = useWriteContract();

    const [amount, setAmount] = useState("");
    const [yesBalance, setYesBalance] = useState<bigint>(0n);
    const [noBalance, setNoBalance] = useState<bigint>(0n);
    const [yesTokenId, setYesTokenId] = useState<bigint | null>(null);
    const [noTokenId, setNoTokenId] = useState<bigint | null>(null);

    const [conditionalTokenAddress, setConditionalTokenAddress] = useState<`0x${string}` | null>(null);

    const [sellQuote, setSellQuote] = useState<bigint | null>(null);
    const [loadingBalances, setLoadingBalances] = useState(false);
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [trading, setTrading] = useState(false);

    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [txHash, setTxHash] = useState("");

    const marketAddress = isValidAddress(market) ? market : null;
    const currentBalance = outcome === "yes" ? yesBalance : noBalance;

    async function loadBalances() {
        if (!address || !marketAddress) {
            setYesBalance(0n);
            setNoBalance(0n);
            return;
        }

        try {
            setLoadingBalances(true);

            const result = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getConditionAndTokenIds",
            }) as [bigint, bigint, bigint];

            const yesId = result[1];
            const noId = result[2];

            setYesTokenId(yesId);
            setNoTokenId(noId);

            const conditionalToken = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: "getConditionalToken",
            });

            const tokenAddress = conditionalToken as `0x${string}`;

            setConditionalTokenAddress(tokenAddress);

            const [yes, no] = await Promise.all([
                readContract(config, {
                    address: tokenAddress,
                    abi: erc1155Abi,
                    functionName: "balanceOf",
                    args: [address, yesId],
                }),

                readContract(config, {
                    address: tokenAddress,
                    abi: erc1155Abi,
                    functionName: "balanceOf",
                    args: [address, noId],
                }),
            ]);

            setYesBalance(yes);
            setNoBalance(no);
        } catch (err) {
            setYesBalance(0n);
            setNoBalance(0n);
        } finally {
            setLoadingBalances(false);
        }
    }

    useEffect(() => {
        if (isConnected && address && chainId === SEPOLIA_CHAIN_ID && marketAddress) {
            void loadBalances();
        }
    }, [address, isConnected, chainId, market,]);

    async function updateSellQuote(value: string,) {
        setSellQuote(null);

        if (!marketAddress) return;
        if (!value) return;

        try {
            const collateralAmount = parseUnits(value, 6);

            if (collateralAmount <= 0n) {
                return;
            }

            setLoadingQuote(true);

            const quote = await readContract(config, {
                address: marketAddress,
                abi: predictionMarketAbi,
                functionName: outcome === "yes" ? "getSellYesQuote" : "getSellNoQuote",
                args: [collateralAmount],
            }) as bigint;

            setSellQuote(quote);
        } catch (err) {
            setSellQuote(null);
        } finally {
            setLoadingQuote(false);
        }
    }

    function handleAmountChange(value: string,) {
        setAmount(value);
        setError("");

        void updateSellQuote(value);
    }

    async function buy(selectedOutcome: "yes" | "no") {
        if (!address) {
            throw new Error("Please connect your wallet first.");
        }

        if (!marketAddress) {
            throw new Error("Invalid market address.");
        }

        if (chainId !== SEPOLIA_CHAIN_ID) {
            throw new Error("Please switch your wallet to Sepolia.",);
        }

        if (!amount) {
            throw new Error("Please enter an amount.");
        }

        const collateralAmount = parseUnits(amount, 6);

        if (collateralAmount <= 0n) {
            throw new Error("Amount must be greater than 0.",);
        }

        setStatus("Checking USDC allowance",);

        const allowance = await readContract(config, {
            address: collateralAddress,
            abi: erc20Abi,
            functionName: "allowance",
            args: [address, marketAddress],
        });

        if (allowance < collateralAmount) {
            setStatus("Approve USDC in your wallet...",);

            const approvalHash = await writeContractAsync({
                address: collateralAddress,
                abi: erc20Abi,
                functionName: "approve",
                args: [marketAddress, collateralAmount],
            });

            setTxHash(approvalHash);

            await waitForTransactionReceipt(
                config,
                {
                    hash: approvalHash,
                },
            );
        }

        setStatus(`Getting ${selectedOutcome.toUpperCase()} quote`,);

        const quote = await readContract(config, {
            address: marketAddress,
            abi: predictionMarketAbi,
            functionName: selectedOutcome === "yes" ? "getBuyYesQuote" : "getBuyNoQuote",
            args: [collateralAmount],
        }) as bigint;

        const minOutcomeTokens = (quote * 95n) / 100n;

        setStatus(`Buying ${selectedOutcome.toUpperCase()}`,);

        const hash = await writeContractAsync({
            address: marketAddress,
            abi: predictionMarketAbi,
            functionName: selectedOutcome === "yes" ? "buyYes" : "buyNo",
            args: [collateralAmount, minOutcomeTokens],
        });

        setTxHash(hash);
        setStatus("Waiting for transaction confirmation");

        await waitForTransactionReceipt(
            config,
            {
                hash,
            },
        );

        setStatus(`Successfully bought ${selectedOutcome.toUpperCase()}!`,);
        setAmount("");
        setSellQuote(null);
        await loadBalances();
    }

    async function sell(selectedOutcome: "yes" | "no",) {
        if (!address) {
            throw new Error("Please connect your wallet first.");
        }

        if (!marketAddress) {
            throw new Error("Invalid market address.");
        }

        if (chainId !== SEPOLIA_CHAIN_ID) {
            throw new Error("Please switch your wallet to Sepolia.",);
        }

        if (!amount) {
            throw new Error("Please enter how much USDC you want to receive.");
        }

        if (!conditionalTokenAddress || yesTokenId === null || noTokenId === null) {
            await loadBalances();

            throw new Error("YES/NO token information is still loading. Please try again.");
        }

        const collateralAmount = parseUnits(amount, 6);

        if (collateralAmount <= 0n) {
            throw new Error("Amount must be greater than 0.",);
        }

        setStatus(`Checking ${selectedOutcome.toUpperCase()} balance`);

        const requiredTokens = await readContract(config, {
            address: marketAddress,
            abi: predictionMarketAbi,
            functionName: selectedOutcome === "yes" ? "getSellYesQuote" : "getSellNoQuote",
            args: [collateralAmount],
        }) as bigint;

        const tokenId = selectedOutcome === "yes" ? yesTokenId : noTokenId;

        const balance = await readContract(config, {
            address: conditionalTokenAddress,
            abi: erc1155Abi,
            functionName: "balanceOf",
            args: [address, tokenId],
        }) as bigint;

        if (balance < requiredTokens) {
            throw new Error(
                `Insufficient ${selectedOutcome.toUpperCase()} balance. ` +
                `You have ${formatUnits(balance, 6)} ` +
                `but need ${formatUnits(requiredTokens, 6)}.`,
            );
        }

        setStatus(`Checking ${selectedOutcome.toUpperCase()} token approval`);

        const approved = await readContract(config, {
            address: conditionalTokenAddress,
            abi: erc1155Abi,
            functionName: "isApprovedForAll",
            args: [address, marketAddress]
        }) as boolean;

        if (!approved) {
            setStatus(`Approve ${selectedOutcome.toUpperCase()} tokens in your wallet...`,);

            const approvalHash = await writeContractAsync({
                address: conditionalTokenAddress,
                abi: erc1155Abi,
                functionName: "setApprovalForAll",
                args: [marketAddress, true],
            });

            setTxHash(approvalHash);

            await waitForTransactionReceipt(
                config,
                {
                    hash: approvalHash,
                },
            );
        }

        const maxOutcomeTokens = (requiredTokens * 105n) / 100n;

        setStatus(`Selling ${selectedOutcome.toUpperCase()}`);

        const hash = await writeContractAsync({
            address: marketAddress,
            abi: predictionMarketAbi,
            functionName: selectedOutcome === "yes" ? "sellYes" : "sellNo",
            args: [collateralAmount, maxOutcomeTokens],
        });

        setTxHash(hash);
        setStatus("Waiting for transaction confirmation");

        await waitForTransactionReceipt(
            config,
            {
                hash,
            },
        );

        setStatus(`Successfully sold ${selectedOutcome.toUpperCase()}!`,);
        setAmount("");
        setSellQuote(null);
        await loadBalances();
    }

    async function handleTrade(action: "BUY" | "SELL") {
        setError("");
        setStatus("");
        setTxHash("");

        try {
            setTrading(true);

            if (action === "BUY") {
                await buy(outcome);
            } else {
                await sell(outcome);
            }
        } catch (err: any) {
            const message = err?.shortMessage || err?.cause?.shortMessage || err?.message || "Transaction failed.";
            setError(message);
            setStatus("");
        } finally {
            setTrading(false);
        }
    }

    const hasSellQuote = sellQuote !== null;
    const insufficientBalance = hasSellQuote && sellQuote! > currentBalance;
    const buyDisabled = !isConnected || chainId !== SEPOLIA_CHAIN_ID || !marketAddress || !amount || trading;
    const sellDisabled = !isConnected || chainId !== SEPOLIA_CHAIN_ID || !marketAddress || !amount ||
        loadingBalances || loadingQuote || trading || !hasSellQuote || insufficientBalance;


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

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
                <Link
                    href={`/trade?market=${encodeURIComponent(market)}&question=${encodeURIComponent(question)}&outcome=yes`}
                    className={`rounded-xl px-4 py-3 text-center font-semibold transition-colors ${outcome === "yes" ? "bg-green-500 text-white shadow-sm" : "text-gray-500 hover:bg-white"}`}
                >
                    Yes
                </Link>
                <Link
                    href={`/trade?market=${encodeURIComponent(market)}&question=${encodeURIComponent(question)}&outcome=no`}
                    className={`rounded-xl px-4 py-3 text-center font-semibold transition-colors ${outcome === "no" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:bg-white"}`}
                >
                    No
                </Link>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                <span className="text-sm text-gray-500">Your {outcome.toUpperCase()} balance</span>

                <span className="font-semibold text-gray-800">
                    {loadingBalances ? "Loading" : `${formatUnits(currentBalance, 6)} ${outcome.toUpperCase()}`}
                </span>
            </div>


            <p className="mt-6 text-sm text-gray-500">
                Choose an action for <span className="font-semibold text-gray-700">{outcome.toUpperCase()}</span>
            </p>

            <div className="mt-3">

                <label htmlFor="trade-amount" className="mb-2 block text-sm font-medium text-gray-700">
                    USDC amount
                </label>

                <input
                    id="trade-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) =>
                        handleAmountChange(
                            event.target.value,
                        )
                    }
                    placeholder="0.00"
                    disabled={trading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#03a9f4] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-gray-400"> Buy: USDC you want to spend. Sell: USDC you want to receive.</p>
            </div>


            {amount && (
                <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{outcome.toUpperCase()} balance</span>
                        <span className="font-medium text-gray-700">{formatUnits(currentBalance, 6,)}{" "}{outcome.toUpperCase()}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Required to sell</span>
                        <span className={insufficientBalance ? "font-medium text-red-500" : "font-medium text-gray-700"}>
                            {loadingQuote ? "Calculating..." : sellQuote === null ? "—" : `${formatUnits(sellQuote, 6,)} ${outcome.toUpperCase()}`}
                        </span>
                    </div>

                    {insufficientBalance && (
                        <p className="mt-2 text-xs text-red-500">Not enough{" "}{outcome.toUpperCase()} tokens.</p>
                    )}
                </div>
            )}


            <div className="mt-3 grid gap-3">

                <button
                    type="button" onClick={() => void handleTrade("BUY")} disabled={buyDisabled}
                    className="rounded-xl bg-[#03a9f4] px-4 py-3.5 font-semibold text-white transition-colors hover:bg-[#0290d3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {trading ? "Processing..." : `Buy ${outcome.toUpperCase()}`}
                </button>

                <button type="button" onClick={() => void handleTrade("SELL")} disabled={sellDisabled}
                    className="rounded-xl border border-gray-300 px-4 py-3.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {trading ? "Processing..." : `Sell ${outcome.toUpperCase()}`}
                </button>
            </div>

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
