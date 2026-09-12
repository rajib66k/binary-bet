"use client";

import Link from "next/link";

type TradePanelProps = {
    market: string;
    question: string;
    outcome: "yes" | "no";
};

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

export function TradePanel({ market, question, outcome }: TradePanelProps) {
    const tokenImage = getTokenImage(question);

    return (
        <section className="mx-auto w-full max-w-md rounded-3xl border border-[#03a9f4]/20 bg-white p-5 shadow-lg shadow-[#03a9f4]/5 sm:p-7">
            <div className="flex items-center justify-between">
                {tokenImage ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#03a9f4]/20 bg-[#03a9f4]/5 shadow-sm">
                        <img src={tokenImage} alt="Market token" className="h-11 w-11" />
                    </div>
                ) : null}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#03a9f4]/40 hover:bg-[#03a9f4]/5 hover:text-[#03a9f4]"
                >
                    <span aria-hidden="true">←</span>
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

            <p className="mt-6 text-sm text-gray-500">
                Choose an action for <span className="font-semibold text-gray-700">{outcome.toUpperCase()}</span>
            </p>
            <div className="mt-3 grid gap-3">
                <button
                    type="button"
                    className="rounded-xl bg-[#03a9f4] px-4 py-3.5 font-semibold text-white transition-colors hover:bg-[#0290d3]"
                >
                    Buy {outcome.toUpperCase()}
                </button>
                <button
                    type="button"
                    className="rounded-xl border border-gray-300 px-4 py-3.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Sell {outcome.toUpperCase()}
                </button>
            </div>
        </section>
    );
}
