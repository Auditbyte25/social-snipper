import axios from "axios";
import { Client } from "@solana-tracker/data-api";

const API_KEY = "33cd33f3-3a21-46db-98d9-e79e891a4939"; // Replace with your actual API key
const BASE_URL = "https://data.solanatracker.io/search";

async function getMemeRequest(trendingWord: string) {
  const options = {
    method: "GET",
    url: "https://deep-index.moralis.io/api/v2.2/tokens/search",
    params: {
      query: `${trendingWord}`,
      chains: "solana",
    },
    headers: {
      accept: "application/json",
      "X-API-Key": "YOUR_API_KEY",
    },
  };

  try {
    const response: any = await axios.request(options);
    console.log(response.data);
    return response;
  } catch (error: any) {
    console.error("Error fetching token data:", error);
    return { status: 500, msg: error.message };
  }
}

async function getTokenHolder(tokenAddress: string) {
  const options = {
    method: "GET",
    url: `https://solana-gateway.moralis.io/token/mainnet/holders/${tokenAddress}`,
    headers: {
      accept: "application/json",
      "X-API-Key": "YOUR_API_KEY",
    },
  };

  try {
    const response: any = await axios.request(options);
    console.log(response.data);
    return response;
  } catch (error: any) {
    console.error("Error fetching token holder data:", error);
    return { status: 500, msg: error.message };
  }
}

async function getLiquidityStat(tokenAddress: string) {
  const options = {
    method: "GET",
    url: `https://solana-gateway.moralis.io/token/mainnet/pairs/${tokenAddress}/stats`,
    headers: {
      accept: "application/json",
      "X-API-Key": "YOUR_API_KEY",
    },
  };

  try {
    const response: any = await axios.request(options);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching token stats:", error);
    return { status: 500, msg: error.message };
  }
}

// SOLANA TRACKER
const searchTokens = async (query: string) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        "x-api-key": API_KEY,
      },
      params: {
        query, // required: token name/symbol/mint address
        limit: 2,
        sortBy: "marketCapUsd",
        sortOrder: "desc",
        showAllPools: false,
      },
    });

    const tokens = response.data.data;
    if (!tokens.length) {
      console.log("No tokens found.");
      return;
    }

    return tokens;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
  }
};

// Get token information: GET /tokens/{tokenAddress}
const getTokenInfo = async (tokenAddress: string) => {
  try {
    const response = await axios.get(
      `https://data.solanatracker.io/tokens/${tokenAddress}`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const tokenInfo = response.data;
    // console.log("Token Info:", tokenInfo.pools[0].price.usd);
    return tokenInfo;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
  }
};

// Get call for token swap
const swapTokens = async (
  from: string,
  to: string,
  fromAmount: number,
  slippage: number,
  payer: string
) => {
  try {
    const response = await axios.get("https://swap-v2.solanatracker.io/swap", {
      params: {
        from,
        to,
        fromAmount,
        slippage,
        payer,
      },
    });

    const swapData = response.data;
    if (!swapData) {
      console.log("No swap data found.");
      return;
    }

    return swapData;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
  }
};

const searchTokensRunner = async (
  query: string,
  minMarketCap: number,
  maxBuys: number,
  maxSells: number,
  maxMarketCap?: number
) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        "x-api-key": API_KEY,
      },
      params: {
        query, // required: token name/symbol/mint address
        limit: 10,
        minMarketCap,
        maxMarketCap,
        maxBuys,
        maxSells: maxSells ? maxSells : 100,
        sortBy: "marketCapUsd",
        sortOrder: "desc",
        showAllPools: false,
      },
    });

    const tokens = response.data.data;
    if (!tokens.length) {
      console.log("No tokens found.");
      return;
    }

    return tokens;
  } catch (error: any) {
    console.error("API Error:", error.response?.data || error.message);
  }
};

export {
  getMemeRequest,
  getTokenHolder,
  getLiquidityStat,
  searchTokens,
  searchTokensRunner,
  getTokenInfo,
  swapTokens,
};

// Example usage
// searchTokens('bonk');
// getTokenInfo("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN");
// swapTokens(
//   "So11111111111111111111111111111111111111112",
//   "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
//   1,
//   10,
//   "GKwt8YJj28L9vBukuiRQkV2Lm9T51Ua9mDb5VUoycWK4"
// );