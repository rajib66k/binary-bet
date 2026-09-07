"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, sepolia } from "wagmi/chains";

const config: ReturnType<typeof getDefaultConfig> = getDefaultConfig({
    appName: "Binary Bet",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia, anvil],
    ssr: false
});

export default config;
