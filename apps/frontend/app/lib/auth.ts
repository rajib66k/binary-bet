import type { Address } from "viem";
import { setAccessToken, clearAccessToken, apiFetch } from "./api";

export function buildAuthMessage(address: Address, nonce: string) {
    return `AI Trading Agent

Sign this message to authenticate with the application.

Wallet: ${address}
Nonce: ${nonce}

This signature does not authorize any blockchain transaction.`;
}

export async function authenticateWallet(
    address: Address,
    signMessage: (args: { message: string }) => Promise<`0x${string}`>
) {
    const nonceResponse = await apiFetch(`/api/auth/nonce?address=${encodeURIComponent(address)}`);
    const nonceData = await nonceResponse.json();

    if (!nonceResponse.ok) {
        throw new Error(nonceData.message ?? "Failed to get authentication nonce");
    }

    const message = buildAuthMessage(nonceData.address, nonceData.nonce);

    const signature = await signMessage({
        message,
    });

    const verifyResponse = await apiFetch(
        "/api/auth/verify",
        {
            method: "POST",
            body: JSON.stringify({
                address,
                signature,
            }),
        }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
        throw new Error(verifyData.message ?? "Wallet authentication failed");
    }

    setAccessToken(verifyData.accessToken);

    return verifyData;
}

export function logout() {
    clearAccessToken();
}