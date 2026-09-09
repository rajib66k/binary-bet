import { querySubgraph } from "./subgraph.js";
import { getTokenIds } from "../lib/market-client.js";
import { GET_MARKET_DETAILS_QUERY, GET_MARKETS_QUERY } from "./queries.js";

export async function getMarkets() {
    return await querySubgraph(GET_MARKETS_QUERY);
}

export async function getMarketDetails(market: string) {
    const data = await querySubgraph(GET_MARKET_DETAILS_QUERY, { market });
    const marketData = data.marketCreateds?.[0] ?? null;

    if (!marketData) {
        return {
            exists: false,
            active: false,
            market: null,
            yes: null,
            no: null,
        };
    }

    const stateEvent = data.marketStateChangeds?.[0] ?? null;
    const currentState = stateEvent ? Number(stateEvent.marketState) : null;

    if (currentState !== 1) {
        return {
            exists: true,
            active: false,
            market: null,
            yes: null,
            no: null,
        };
    }

    const tokenIds = await getTokenIds(market);
    const yesTokenId = tokenIds.yesTokenId.toString();
    const noTokenId = tokenIds.noTokenId.toString();

    const buys = data.boughts ?? [];
    const sells = data.solds ?? [];

    const yesBuys = buys.filter((trade: { tokenId: string }) => trade.tokenId === yesTokenId);
    const noBuys = buys.filter((trade: { tokenId: string }) => trade.tokenId === noTokenId);
    const yesSells = sells.filter((trade: { tokenId: string }) => trade.tokenId === yesTokenId);
    const noSells = sells.filter((trade: { tokenId: string }) => trade.tokenId === noTokenId);

    function sumCollateral(trades: { collateralAmount?: string }[]): bigint {
        return trades.reduce(
            (total, trade) =>
                total +
                BigInt(
                    trade.collateralAmount ?? "0",
                ),
            0n,
        );
    }

    const yesBuyVolume = sumCollateral(yesBuys);
    const yesSellVolume = sumCollateral(yesSells);
    const noBuyVolume = sumCollateral(noBuys);
    const noSellVolume = sumCollateral(noSells);

    return {
        exists: true,
        active: true,

        market: {
            market: marketData.market,
            questionId: marketData.questionId,
            createdAt: marketData.blockTimestamp,
        },

        yes: {
            buys: yesBuys.length,
            sells: yesSells.length,
            buyVolume: yesBuyVolume.toString(),
            sellVolume: yesSellVolume.toString(),
            netVolume: (yesBuyVolume - yesSellVolume).toString(),
        },

        no: {
            buys: noBuys.length,
            sells: noSells.length,
            buyVolume: noBuyVolume.toString(),
            sellVolume: noSellVolume.toString(),
            netVolume: (noBuyVolume - noSellVolume).toString(),
        },
    }
}
