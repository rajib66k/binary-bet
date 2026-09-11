export const GET_MARKETS_QUERY = `
    query Markets {
        marketCreateds(
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          market
          question
          questionId
          lpToken
          resolveTime
          blockTimestamp
        }
    }
`;

export const GET_MARKET_DETAILS_QUERY = `
    query MarketData($market: Bytes!) {
        marketCreateds(
            where: { market: $market }
            first: 1
        ) {
            market
            questionId
            lpToken
            blockTimestamp
        }

        boughts(
            where: { market: $market }
            orderBy: blockTimestamp
            orderDirection: desc
        ) {
            buyer
            tokenId
            collateralAmount
            fee
            amountBrought
            blockTimestamp
        }

        solds(
            where: { market: $market }
            orderBy: blockTimestamp
            orderDirection: desc
        ) {
            buyer
            tokenId
            collateralAmount
            fee
            amountSold
            blockTimestamp
        }

        marketStateChangeds(
            where: { market: $market }
            first: 1
            orderBy: blockTimestamp
            orderDirection: desc
        ) {
            marketState
            blockTimestamp
        }
    }
`;