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