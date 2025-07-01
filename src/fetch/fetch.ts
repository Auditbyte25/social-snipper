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
};

// Example usage
searchTokens('bonk');