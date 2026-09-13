"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAccessToken } from "../../app/lib/api";
import { authenticateWallet } from "../../app/lib/auth";

export default function AuthButton() {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isConnected || !address) {
            setAuthenticated(false);
            return;
        }

        setAuthenticated(Boolean(getAccessToken()));
    }, [address, isConnected]);

    async function handleAuthenticate() {
        if (!address) return;

        try {
            setLoading(true);
            setError("");

            await authenticateWallet(address, signMessageAsync);

            setAuthenticated(true);
        } catch (error) {
            setError(error instanceof Error ? error.message: "Authentication failed");
        } finally {
            setLoading(false);
        }
    }

    if (!isConnected) {
        return <ConnectButton />;
    }

    if (authenticated) {
        return (<ConnectButton accountStatus="address" chainStatus="icon" showBalance={false}/>);
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={handleAuthenticate}
                disabled={loading}
                className="rounded-xl bg-[#03a9f4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0290d3] disabled:opacity-50"
            >
                {loading ? "Signing..." : "Sign in"}
            </button>

            {error && (
                <p className="max-w-[220px] text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}