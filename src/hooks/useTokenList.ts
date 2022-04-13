import { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import { Ocean, TokenList } from "@dataxfi/datax.js";
// import { TokenList as TList } from "@uniswap/token-lists";

export interface TokenInfo {
  address: string;
  chainId: string | number;
  decimals: string | number;
  logoURI: string;
  name: string;
  symbol: string;
  pool: string;
}

export default function useTokenList(otherToken: string, setLoading: Function) {
  const { location, chainId, web3, setTokenResponse, tokenResponse, setCurrentTokens, accountId } =
    useContext(GlobalContext);


  useEffect(() => {
    if (accountId) {
      setLoading(true);
      const tokenList = new TokenList(
        web3,
        "4",
        process.env.REACT_APP_PINATA_KEY || "",
        process.env.REACT_APP_PINATA_KEY || ""
      );

      tokenList
        .fetchPreparedTokenList(chainId ? chainId : 4)
        .then((res) => {
          setTokenResponse(res);
          //@ts-ignore
          const formattedList = formatTokenList(res, otherToken, location);
          if (setCurrentTokens) setCurrentTokens(formattedList);
        })
        .catch((err) => {
          console.error("An error occurred while fetching the token list.", err);
          setTokenResponse(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [location, otherToken]);
}

export function formatTokenList(
  tokenResponse: { tokens: TokenInfo[] },
  otherToken: any,
  location: string
): TokenInfo[] {
  let tokenList: TokenInfo[] = tokenResponse.tokens;
  if (location === "/trade") {
    tokenList = tokenResponse.tokens.filter((t) => t.symbol !== otherToken);
  } else {
    tokenList = tokenResponse.tokens.filter((t) => {
      if (t.symbol !== otherToken && t.pool) return t;
    });
  }
  if (tokenList.length > 0) {
    //@ts-ignore
    const oceanToken: TokenInfo = tokenList.pop();
    tokenList.splice(0, 0, oceanToken);
  }
  return tokenList;
}

export async function getAllowance(tokenAddress: string, accountId: string, router: string, ocean: Ocean) {
  return await ocean.getAllowance(tokenAddress, accountId, router);
}
