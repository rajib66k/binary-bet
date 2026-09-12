import { MarketCard, type MarketData } from "./MarketCard";

type MarketsResponse = {
  markets: MarketData[];
};

const API_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

async function getMarkets(): Promise<MarketData[]> {
  const response = await fetch(`${API_URL}/api/markets`, {
    next: { revalidate: 30 },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Markets request failed with status ${response.status}`);
  }

  const data = (await response.json()) as MarketsResponse;

  if (!Array.isArray(data.markets)) {
    throw new Error("Markets response has an invalid format");
  }

  return data.markets;
}

export async function MarketGrid() {
  const markets = await getMarkets();

  return (
    <div>
      <h1 className="font-semibold text-xl">All markets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 my-4">
        {markets.map((market, index) => (
          <MarketCard key={market.market || index} market={market} />
        ))}
      </div>
    </div>
  );
}
