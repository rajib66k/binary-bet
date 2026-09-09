import { env } from "../config/env.js";

export async function querySubgraph(query: string, variables: Record<string, unknown> = {}) {
    const response = await fetch(env.graphEndpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    if (!response.ok) {
        throw new Error(`Subgraph request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
        throw new Error(result.errors[0]?.message ?? "Subgraph query failed");
    }

    return result.data;
}
