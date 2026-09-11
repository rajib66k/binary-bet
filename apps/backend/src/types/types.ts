export type AgentConfig = {
    id: string;
    owner: string;
    name: string;

    walletAddress: string;

    maxTradeAmount: number;
    maxExposure: number;
    dailyLossLimit: number;

    allowedMarkets?: string[];
}

export type ExecuteTradeParams = {
    privateKey: `0x${string}`;
    marketAddress: string;
    action: "BUY" | "SELL";
    outcome: "YES" | "NO";
    amount: number;
};

export type CreateAgentInput = {
    ownerAddress: string;
    name: string;
    maxTradeAmount: number;
    maxExposure: number;
    dailyLossLimit: number;
    allowedMarkets: string[];
};