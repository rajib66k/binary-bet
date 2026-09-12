import Link from "next/link";

export interface MarketData {
    market: string;
    question: string;
}

const TOKEN_IMAGES: Record<string, string> = {
  BTC: "/tokens/btc.svg",
  ETH: "/tokens/eth.svg",
};

function getImageUrl(question: string): string | null {
  const symbols = Object.keys(TOKEN_IMAGES);
  const upperQuestion = question.toUpperCase();

  for (const symbol of symbols) {
    if (upperQuestion.includes(symbol)) {
      return TOKEN_IMAGES[symbol] ?? null;
    }
  }

  const names: Record<string, string> = {
    BITCOIN: "BTC",
    ETHEREUM: "ETH"
  };

  for (const [name, symbol] of Object.entries(names)) {
    if (upperQuestion.includes(name)) {
      return symbol ? TOKEN_IMAGES[symbol] ?? null : null;
    }
  }

  return null;
}

export function MarketCard({ market }: { market: MarketData }) {
    return (
        <div className="w-full overflow-hidden rounded-2xl border border-[#03a9f4]/20 bg-white shadow-sm">
            <div className="p-4">

                <div className="flex items-start gap-3">
                    <img src={getImageUrl(market.question) ?? undefined} alt="" className="h-10 w-10 shrink-0" />
                    <h3 className="text-base font-semibold leading-snug text-gray-900">{market.question}</h3>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                        href={`/trade?market=${encodeURIComponent(market.market)}&question=${encodeURIComponent(market.question)}&outcome=yes`}
                        className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 font-medium text-green-600 transition-colors hover:bg-green-500/20"
                    >
                        Yes
                    </Link>

                    <Link
                        href={`/trade?market=${encodeURIComponent(market.market)}&question=${encodeURIComponent(market.question)}&outcome=no`}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-medium text-red-600 transition-colors hover:bg-red-500/20"
                    >
                        No
                    </Link>
                </div>

                <div className="mt-4 flex items-center gap-1 text-sm">
                    <span className="h-1 w-1 rounded-full bg-red-500" />
                    <span className="font-medium text-red-500">LIVE</span>
                    <span className="text-gray-400">·</span>
                </div>

            </div>
        </div>
    );
}
