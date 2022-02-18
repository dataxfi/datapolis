import { Ocean, TokenList } from "@dataxfi/datax.js";

export interface TokenInfo {
  address: string;
  chainId: string | number;
  decimals: string | number;
  logoURI: string;
  name: string;
  symbol: string;
  pool?: string;
}

export default async function getTokenList({
  chainId,
  web3,
  setTokenResponse,
  setCurrentTokens,
  accountId,
  otherToken,
}: {
  chainId: number;
  web3: any;
  setTokenResponse: Function;
  setCurrentTokens?: Function;
  accountId: string;
  otherToken?: string;
}): Promise<any> {
  if (accountId) {
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
        console.log("Token Response:", res);
        const formattedList = formatTokenList(res, otherToken);
        if (setCurrentTokens) setCurrentTokens(formattedList);
      })
      .catch((err) => {
        console.error("An error occurred while fetching the token list.", err);
        setTokenResponse(null);
      });
  }
}

export function formatTokenList(tokenResponse: { tokens: { symbol: string }[] }, otherToken: any) {
  const tokenList = tokenResponse.tokens.filter((t) => t.symbol !== otherToken);
  const oceanToken = tokenList.pop();
  tokenList.splice(0, 0, oceanToken || { symbol: "OCEAN" });
  return tokenList;
}

export async function getAllowance(tokenAddress: string, accountId: string, router: string, ocean: Ocean) {
  return await ocean.getAllowance(tokenAddress, accountId, router);
}
