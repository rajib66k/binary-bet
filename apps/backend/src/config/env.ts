import dotenv from "dotenv";

dotenv.config();

function checkRequiredEnvVariables(key: string): string {
    const value = process.env[key];

    if(!value) {
        throw new Error(`Missing env variables for ${key}`);
    }

    return value;
}

export const env = {
    port: Number(process.env.PORT ?? 5000),
    isProduction: (process.env.NODE_ENV ?? "development") === "production",
    nodeEnv: process.env.NODE_ENV ?? "development",
    logLevel: process.env.LOG_LEVEL ?? "info",
    databaseUrl: checkRequiredEnvVariables("DATABASE_URL"),
    graphEndpoint: checkRequiredEnvVariables("GRAPH_ENDPOINT"),
    rpcUrl: checkRequiredEnvVariables("RPC_URL"),
    agentWalletEncryptionKey: checkRequiredEnvVariables("AGENT_WALLET_ENCRYPTION_KEY"),
    jwtAccessSecret: checkRequiredEnvVariables("JWT_SECRET"),
    jwtAccessExpiresIn: ("JWT_ACCESS_EXPIRES_IN"),
    agentExecutionUrl: ("AGENT_EXECUTION_URL"),
} as const;