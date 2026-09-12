"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

type Decision = {
    action: "BUY" | "SELL" | "HOLD";
    marketAddress: string;
    outcome: "YES" | "NO" | null;
    amount: number;
    confidence: number;
    reason: string;
    requiresHumanApproval: boolean;
};

const initialDecision: Decision = {
    action: "HOLD",
    marketAddress: "No decision yet",
    outcome: null,
    amount: 0,
    confidence: 0,
    reason: "Run your agent to generate its next trading decision.",
    requiresHumanApproval: false,
};

function shortenAddress(address: string | undefined) {
    if (!address) {
        return "Connect a wallet to load your agent";
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function MyAgent() {
    const { address } = useAccount();
    const [decision, setDecision] = useState<Decision>(initialDecision);
    const [isRunning, setIsRunning] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [copied, setCopied] = useState(false);

    function runAgent() {
        setIsRunning(true);
        window.setTimeout(() => {
            setDecision({
                action: "HOLD",
                marketAddress: "Waiting for market analysis",
                outcome: null,
                amount: 0,
                confidence: 0,
                reason: "No trade has been recommended yet.",
                requiresHumanApproval: true,
            });
            setIsRunning(false);
        }, 600);
    }

    return (
        <main className="mx-auto w-full max-w-4xl px-[5vw] py-8">
            <div className="mb-8">
                <p className="text-sm font-medium text-[#03a9f4]">Automation center</p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">My Agent</h1>
                <p className="mt-2 text-gray-500">Manage your trading agent and review its latest decision.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-3xl border border-[#03a9f4]/20 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Agent name</p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">My Trading Agent</h2>
                        </div>
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">Active</span>
                    </div>

                    <div className="mt-8">
                        <p className="text-sm text-gray-500">Wallet address</p>
                        <div className="mt-2 flex items-center gap-2">
                            <p className="break-all font-mono text-sm text-gray-800">{shortenAddress(address)}</p>
                            {address && (
                                <button
                                    type="button"
                                    aria-label="Copy wallet address"
                                    title={copied ? "Copied" : "Copy address"}
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(address);
                                        setCopied(true);
                                        window.setTimeout(() => setCopied(false), 1500);
                                    }}
                                    className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[#03a9f4]/10 hover:text-[#03a9f4]"
                                >
                                    <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">World registration</p>
                            </div>
                            <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${isRegistered ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                                {isRegistered ? "Registered" : "Not registered"}
                            </span>
                        </div>
                        {!isRegistered && (
                            <button
                                type="button"
                                onClick={() => setIsRegistered(true)}
                                className="mt-4 w-full rounded-xl bg-[#03a9f4] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#0290d3]"
                            >
                                Register agent
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={runAgent}
                        disabled={isRunning || !isRegistered}
                        className="mt-5 w-full rounded-xl border border-[#03a9f4] px-4 py-3 font-semibold text-[#03a9f4] transition-colors hover:bg-[#03a9f4]/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRunning ? "Running agent..." : "Run agent"}
                    </button>
                </section>

                <section className="rounded-3xl border border-[#03a9f4]/20 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#03a9f4]">Latest output</p>
                            <h2 className="mt-1 text-2xl font-semibold text-gray-900">Decision</h2>
                        </div>
                        <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700">{decision.action}</span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <DecisionValue label="Market address" value={decision.marketAddress} />
                        <DecisionValue label="Outcome" value={decision.outcome ?? "None"} />
                        <DecisionValue label="Amount" value={decision.amount.toString()} />
                        <DecisionValue label="Confidence" value={`${Math.round(decision.confidence * 100)}%`} />
                    </div>

                    <div className="mt-3 rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Reason</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">{decision.reason}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setDecision((current) => ({
                            ...current,
                            requiresHumanApproval: !current.requiresHumanApproval,
                        }))}
                        className="mt-3 flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-left transition-colors hover:border-[#03a9f4]/40 hover:bg-[#03a9f4]/5"
                        aria-label="Toggle human approval requirement"
                    >
                        <span className="text-sm text-gray-600">Human approval required</span>
                        <span className={`text-sm font-semibold ${decision.requiresHumanApproval ? "text-amber-600" : "text-green-600"}`}>
                            {decision.requiresHumanApproval ? "Yes" : "No"}
                        </span>
                    </button>
                </section>
            </div>
        </main>
    );
}

function DecisionValue({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <p className="mt-2 break-words text-sm font-medium text-gray-800">{value}</p>
        </div>
    );
}
