"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { apiFetch } from "../app/lib/api";
import LimitInput from "./ui/LimitInput";
import DecisionValue from "./ui/DecisionValue";
import EmptyState from "./ui/EmptyState";
import { predictionMarketAbi } from "../constants";
import { readContract } from "wagmi/actions";

type Agent = {
    id: string;
    name: string;
    wallet_address: string;
    max_trade_amount: string | number;
    max_exposure: string | number;
    daily_loss_limit: string | number;
    allowed_markets: string[];
    active: boolean;
    human_backed: boolean;
    registration_status: string;
};

type Decision = {
    action: "BUY" | "SELL" | "HOLD";
    marketAddress: string;
    outcome: "YES" | "NO" | null;
    amount: number;
    confidence: number;
    reason: string;
    requiresHumanApproval: boolean;
};

type AgentRunResult = {
    executed?: boolean;
    decision?: Decision;
    reason?: string;
    transaction?: {
        hash?: string;
        agentWallet?: string;
        marketAddress?: string;
        functionName?: string;
    };
    humanBacked?: boolean;
    agentWallet?: string;
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

const emptyForm = {
    name: "",
    maxTradeAmount: "",
    maxExposure: "",
    dailyLossLimit: "",
};

function shortenAddress(address?: string) {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "No wallet";
}

function isVerified(agent: Agent) {
    return agent.human_backed && agent.registration_status === "verified";
}

function registrationLabel(agent: Agent) {
    if (isVerified(agent)) return "Registered";
    if (agent.registration_status === "pending") return "Pending";
    return "Not registered";
}

export default function MyAgent() {
    const { address } = useAccount();

    const chainId = useChainId();
    const config = useConfig();

    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [decision, setDecision] = useState(initialDecision);
    const [runResult, setRunResult] = useState<AgentRunResult | null>(null);

    const [worldUrl, setWorldUrl] = useState("");
    const [registrationMessage, setRegistrationMessage] = useState("");
    const [copied, setCopied] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimMessage, setClaimMessage] = useState("");
    const [claimTx, setClaimTx] = useState("");
    const [marketResolved, setMarketResolved] = useState(false);

    const selectedAgent =
        agents.find((agent) => agent.id === selectedAgentId) ?? null;

    async function loadAgents() {
        if (!address) {
            setAgents([]);
            setSelectedAgentId(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            const response = await apiFetch("/api/agents");
            if (!response.ok) throw new Error(await response.text());

            const data = await response.json();
            const loaded: Agent[] = data.agents ?? data.data ?? [];

            setAgents(loaded);

            setSelectedAgentId((current) =>
                current && loaded.some((a) => a.id === current) ? current : loaded[0]?.id ?? null
            );
        } catch (error) {
            setAgents([]);
            setSelectedAgentId(null);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadAgents();
    }, [address]);

    useEffect(() => {
        setDecision(initialDecision);
        setRunResult(null);
        setWorldUrl("");
        setRegistrationMessage("");
        setCopied(false);
    }, [selectedAgentId]);

    function updateForm(field: keyof typeof form, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateAgent(id: string,
        field: "name" | "max_trade_amount" | "max_exposure" | "daily_loss_limit",
        value: string
    ) {
        setAgents((current) => current.map((agent) => agent.id === id ? { ...agent, [field]: value } : agent));
    }

    async function createAgent() {
        if (!form.name.trim() || !form.maxTradeAmount || !form.maxExposure || !form.dailyLossLimit) {
            return;
        }

        try {
            setIsCreating(true);

            const response = await apiFetch("/api/agents", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name.trim(),
                    maxTradeAmount: form.maxTradeAmount,
                    maxExposure: form.maxExposure,
                    dailyLossLimit: form.dailyLossLimit,
                    allowedMarkets: [],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to create agent");
            }

            setForm(emptyForm);
            setShowCreateForm(false);
            await loadAgents();
        } catch (error) {
            console.error("Failed to create agent:", error);
        } finally {
            setIsCreating(false);
        }
    }

    async function saveAgent(agent: Agent) {
        try {
            setSavingId(agent.id);

            const response = await apiFetch(`/api/agents/${agent.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: agent.name,
                    maxTradeAmount: agent.max_trade_amount,
                    maxExposure: agent.max_exposure,
                    dailyLossLimit: agent.daily_loss_limit,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Failed to save agent");
            }

            setAgents((current) => current.map((a) => (a.id === agent.id ? data.agent : a)));
        } catch (error) {
            console.error("Failed to save agent:", error);
        } finally {
            setSavingId(null);
        }
    }

    async function startWorldVerification() {
        if (!selectedAgent) return;

        try {
            setIsRegistering(true);
            setRegistrationMessage("");
            setWorldUrl("");

            const response = await apiFetch(`/api/agents/${selectedAgent.id}/world-verification`, { method: "POST", body: JSON.stringify({}) });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "World verification failed");
            }

            if (data.humanBacked || data.status === "verified") {
                setRegistrationMessage("Agent is already World verified.");
                await loadAgents();
                return;
            }

            if (data.worldUrl) {
                setWorldUrl(data.worldUrl);
                setRegistrationMessage("Scan the QR code or open World to complete verification.");
            } else {
                setRegistrationMessage(data.message || "Waiting for World verification.");
            }

            void pollWorldRegistration(selectedAgent.id);
        } catch (error) {
            setRegistrationMessage(error instanceof Error ? error.message : "World verification failed.");
        } finally {
            setIsRegistering(false);
        }
    }

    async function pollWorldRegistration(agentId: string) {
        for (let i = 0; i < 150; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            try {
                const response = await apiFetch(`/api/agents/${agentId}/world-registration-status`);

                if (!response.ok) continue;

                const data = await response.json();

                if (data.worldUrl) setWorldUrl(data.worldUrl);

                if (data.humanBacked || data.status === "verified") {
                    setRegistrationMessage("World verification completed.");
                    await loadAgents();
                    return;
                }

                if (data.status === "failed") {
                    setRegistrationMessage(data.message || "World verification failed.");
                    return;
                }
            } catch (error) {
                console.error("Registration polling error:", error);
            }
        }

        setRegistrationMessage("Verification is taking longer than expected.");
    }

    async function runAgent() {
        if (!selectedAgent) return;

        try {
            setIsRunning(true);
            setRunResult(null);

            const response = await apiFetch(`/api/agents/${selectedAgent.id}/run`, { method: "POST", body: JSON.stringify({}) });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Agent execution failed.");
            }

            const result: AgentRunResult = data.result ?? data;

            setRunResult(result);
            if (result.decision) setDecision(result.decision);
        } catch (error) {
            setRunResult({
                executed: false,
                reason: error instanceof Error ? error.message : "Agent execution failed.",
            });
        } finally {
            setIsRunning(false);
        }
    }

    async function checkMarketResolved() {
        const marketAddress = decision.marketAddress;

        if (!/^0x[a-fA-F0-9]{40}$/.test(marketAddress)) {
            setMarketResolved(false);
            return;
        }

        try {
            const state = await readContract(
                config,
                {
                    address: marketAddress as `0x${string}`,
                    abi: predictionMarketAbi,
                    functionName: "getMarketState",
                },
            );

            setMarketResolved(
                Number(state) === 2,
            );
        } catch (error) {
            setMarketResolved(false);
        }
    }

    useEffect(() => {
        if (decision.marketAddress !== "No decision yet") {
            void checkMarketResolved();
        }
    }, [decision.marketAddress]);

    async function claimAgentWinnings() {
        if (!selectedAgent) return;

        if (!address) {
            setClaimMessage("Connect your wallet first.");
            return;
        }

        if (chainId !== 11155111) {
            setClaimMessage("Please switch your wallet to Sepolia.");
            return;
        }

        if (!marketResolved) {
            setClaimMessage("The market is not resolved yet.",);
            return;
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(decision.marketAddress)) {
            setClaimMessage("No valid market is available for this agent.",);
            return;
        }

        try {
            setIsClaiming(true);
            setClaimMessage("");
            setClaimTx("");

            const response = await apiFetch(
                `/api/agents/${selectedAgent.id}/claim`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        marketAddress:
                            decision.marketAddress,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Claim failed.");
            }

            setClaimMessage(`Successfully claimed ${Number(data.result.amount,) / 1_000_000} USDC.`);

            if (data.result.claimTransaction) {
                setClaimTx(data.result.claimTransaction);
            }
        } catch (error) {
            setClaimMessage(error instanceof Error ? error.message : "Claim failed.",);
        } finally {
            setIsClaiming(false);
        }
    }

    async function copyWallet() {
        if (!selectedAgent) return;

        try {
            await navigator.clipboard.writeText(selectedAgent.wallet_address);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error("Failed to copy wallet:", error);
        }
    }

    const verified = selectedAgent ? isVerified(selectedAgent) : false;

    return (
        <main className="mx-auto w-full max-w-4xl px-[5vw] py-8">
            {/* HEADER */}
            <div className="mb-8">
                <p className="text-sm font-medium text-[#03a9f4]">Automation center</p>

                <div className="mt-1 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Agent</h1>
                        <p className="mt-2 text-gray-500">Manage your trading agents and review their latest decisions.</p>
                    </div>

                    {address && (
                        <button type="button" onClick={() => setShowCreateForm((v) => !v)} className="rounded-xl bg-[#03a9f4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0290d3]" >
                            + Create agent
                        </button>
                    )}
                </div>
            </div>

            {showCreateForm && (
                <section className="mb-5 rounded-3xl border border-[#03a9f4]/20 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Create new agent</h2>
                        <button type="button" onClick={() => setShowCreateForm(false)} className="text-sm text-gray-400">Cancel</button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Agent name" className="min-w-0 rounded-xl bg-gray-100 p-3 outline-none" />
                        <input type="number" min="0" value={form.maxTradeAmount} onChange={(e) => updateForm("maxTradeAmount", e.target.value)} placeholder="Max trade amount" className="min-w-0 rounded-xl bg-gray-100 p-3 outline-none" />
                        <input type="number" min="0" value={form.maxExposure} onChange={(e) => updateForm("maxExposure", e.target.value)} placeholder="Max exposure" className="min-w-0 rounded-xl bg-gray-100 p-3 outline-none" />
                        <input type="number" min="0" value={form.dailyLossLimit} onChange={(e) => updateForm("dailyLossLimit", e.target.value)} placeholder="Daily loss limit" className="min-w-0 rounded-xl bg-gray-100 p-3 outline-none" />
                    </div>

                    <button
                        type="button"
                        onClick={createAgent}
                        disabled={isCreating || !form.name || !form.maxTradeAmount || !form.maxExposure || !form.dailyLossLimit}
                        className="mt-4 rounded-xl bg-[#03a9f4] px-5 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        {isCreating ? "Creating..." : "Create agent"}
                    </button>
                </section>
            )}

            {!address ? (
                <EmptyState title="Connect your wallet" description="Connect a wallet to create and manage your trading agents." />
            ) : isLoading ? (
                <EmptyState title="Loading agents..." description="Loading your trading agents." />
            ) : agents.length === 0 ? (
                <EmptyState title="Create your first trading agent" description="Your AI agent will analyze prediction markets within your configured risk limits." />
            ) : (
                <>
                    <section className="mb-5 rounded-3xl border border-[#03a9f4]/20 bg-white p-4 shadow-sm">
                        <p className="mb-3 text-sm font-medium text-[#03a9f4]">Your agents</p>

                        <div className="grid gap-2 sm:grid-cols-2">
                            {agents.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedAgentId(item.id)
                                    }
                                    className={`rounded-2xl border p-4 text-left ${item.id === selectedAgentId
                                        ? "border-[#03a9f4] bg-[#03a9f4]/5"
                                        : "border-gray-200 hover:border-[#03a9f4]/40"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">{item.name}</p>
                                            <p className="mt-1 truncate font-mono text-xs text-gray-400">
                                                {shortenAddress(
                                                    item.wallet_address
                                                )}
                                            </p>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isVerified(item)
                                                ? "bg-green-500/10 text-green-600"
                                                : item.registration_status ===
                                                    "pending"
                                                    ? "bg-amber-500/10 text-amber-600"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            {registrationLabel(item)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {selectedAgent && (
                        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                            <section className="rounded-3xl border border-[#03a9f4]/20 bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm text-gray-500">Agent name</p>

                                        <input value={selectedAgent.name}
                                            onChange={(e) =>
                                                updateAgent(selectedAgent.id, "name", e.target.value)
                                            }
                                            className="mt-1 w-full min-w-0 rounded-lg border border-transparent bg-transparent text-2xl font-semibold outline-none focus:border-[#03a9f4]/30"
                                        />
                                    </div>

                                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${selectedAgent.active ? "bg-green-500/10 text-green-600" : "bg-gray-100 text-gray-500"}`} >
                                        {selectedAgent.active ? "Active" : "Paused"}
                                    </span>
                                </div>

                                <div className="mt-8">
                                    <p className="text-sm text-gray-500">Wallet address</p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <p className="break-all font-mono text-sm text-gray-800">
                                            {shortenAddress(selectedAgent.wallet_address)}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={copyWallet}
                                            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-[#03a9f4]/10 hover:text-[#03a9f4]"
                                        >
                                            {copied ? "✓" : "⧉"}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <p className="mb-2 text-sm text-gray-500">Risk limits</p>

                                    <div className="grid grid-cols-3 gap-2">
                                        <LimitInput
                                            label="Trade"
                                            value={selectedAgent.max_trade_amount}
                                            onChange={(value) =>
                                                updateAgent(selectedAgent.id, "max_trade_amount", value)
                                            }
                                        />

                                        <LimitInput
                                            label="Exposure"
                                            value={selectedAgent.max_exposure}
                                            onChange={(value) =>
                                                updateAgent(selectedAgent.id, "max_exposure", value)
                                            }
                                        />

                                        <LimitInput
                                            label="Daily loss"
                                            value={selectedAgent.daily_loss_limit}
                                            onChange={(value) =>
                                                updateAgent(selectedAgent.id, "daily_loss_limit", value)
                                            }
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => saveAgent(selectedAgent)}
                                        disabled={savingId === selectedAgent.id}
                                        className="mt-3 rounded-xl border border-[#03a9f4] px-4 py-2 text-sm font-semibold text-[#03a9f4] disabled:opacity-50"
                                    >
                                        {savingId === selectedAgent.id ? "Saving..." : "Save changes"}
                                    </button>
                                </div>

                                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">World registration</p>
                                            <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                                Human backing is required before this agent can trade.
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-semibold">
                                            {registrationLabel(selectedAgent)}
                                        </span>
                                    </div>

                                    {!verified && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={startWorldVerification}
                                                disabled={isRegistering}
                                                className="mt-4 w-full rounded-xl bg-[#03a9f4] px-4 py-3 font-semibold text-white disabled:opacity-50"
                                            >
                                                {isRegistering ? "Starting verification..." : "Complete World verification"}
                                            </button>

                                            {registrationMessage && (
                                                <p className="mt-3 text-xs leading-relaxed text-gray-500">{registrationMessage}</p>
                                            )}

                                            {worldUrl && (
                                                <div className="mt-4 rounded-2xl border border-[#03a9f4]/20 bg-white p-4">
                                                    <div className="flex flex-col items-center">
                                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Scan with World</p>

                                                        <div className="max-w-full overflow-auto rounded-xl border border-gray-200 p-3">
                                                            <QRCodeSVG value={worldUrl} size={160} level="M" />
                                                        </div>

                                                        <a
                                                            href={worldUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-4 text-sm font-semibold text-[#03a9f4] hover:underline"
                                                        >
                                                            Open World verification
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {verified && (
                                        <div className="mt-4 rounded-xl bg-green-500/5 px-3 py-2">
                                            <p className="text-xs font-medium text-green-600">Agent is backed by a World-verified human</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={runAgent}
                                    disabled={isRunning || !verified || !selectedAgent.active}
                                    className="mt-5 w-full rounded-xl border border-[#03a9f4] px-4 py-3 font-semibold text-[#03a9f4] hover:bg-[#03a9f4]/5 disabled:opacity-50"
                                >
                                    {isRunning ? "Running agent..." : verified ? "Run agent" : "Verify agent to trade"}
                                </button>
                                {marketResolved && (
                                    <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">

                                        <div className="flex items-start justify-between gap-3">

                                            <div>
                                                <p className="text-sm font-semibold text-green-700">Market resolved</p>
                                                <p className="mt-1 text-xs leading-relaxed text-green-600">Your agent may have a redeemable position.</p>
                                            </div>

                                            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-600">RESOLVED</span>
                                        </div>

                                        <button
                                            type="button" onClick={() => { void claimAgentWinnings(); }} disabled={isClaiming || !selectedAgent}
                                            className="mt-4 w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isClaiming ? "Claiming agent winnings..." : "Claim agent winnings"}
                                        </button>

                                        {claimMessage && (
                                            <p className="mt-3 text-xs leading-relaxed text-gray-600">{claimMessage}</p>
                                        )}

                                        {claimTx && (
                                            <a href={`https://sepolia.etherscan.io/tx/${claimTx}`} target="_blank" rel="noreferrer" className="mt-2 block text-xs font-semibold text-green-600 hover:underline">
                                                View claim transaction
                                            </a>
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-3xl border border-[#03a9f4]/20 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-[#03a9f4]">Latest output</p>
                                        <h2 className="mt-1 text-2xl font-semibold">Decision</h2>
                                    </div>

                                    <span
                                        className={`rounded-xl px-3 py-2 text-sm font-bold ${decision.action === "BUY"
                                            ? "bg-green-500/10 text-green-600"
                                            : decision.action === "SELL"
                                                ? "bg-red-500/10 text-red-600"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {decision.action}
                                    </span>
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

                                {runResult && (
                                    <div className="mt-3 rounded-2xl border border-gray-200 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Execution</p>

                                        <p className="mt-2 text-sm text-gray-700">
                                            {runResult.executed ? "Trade execution completed." : runResult.reason || "Agent did not execute a trade."}
                                        </p>

                                        {runResult.transaction?.hash && (
                                            <p className="mt-2 break-all font-mono text-xs text-gray-500">TX:{" "}{runResult.transaction.hash}</p>
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
