import { TokenList } from "@dataxfi/datax.js";

export interface TokenInfo { 
  address: string 
  chainId: string | number
  decimals:string | number 
  logoURI: string 
  name: string 
  symbol: string 
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
  setCurrentTokens?:Function 
  accountId: string;
  otherToken?:string
}): Promise<any> {
  if (accountId) {
    const tokenList = new TokenList(
      web3,
      "4",
      process.env.REACT_APP_PINATA_KEY || "",
      process.env.REACT_APP_PINATA_KEY || ""
    );

    const {
      REACT_APP_CLIENT_EMAIL = "",
      REACT_APP_PRIVATE_KEY = "",
      REACT_APP_TOKEN_URI = "",
      REACT_APP_SCOPE = "",
      REACT_APP_PRIVATE_KEY_ID = "",
    } = process.env;

    return tokenList
      .fetchPreparedTokenList(
        chainId ? chainId : 4,
        REACT_APP_CLIENT_EMAIL,
        REACT_APP_PRIVATE_KEY,
        REACT_APP_TOKEN_URI,
        REACT_APP_SCOPE,
        REACT_APP_PRIVATE_KEY_ID
      )
      .then((res) => {
        setTokenResponse(res);
        const formattedList = formatTokenList(res, otherToken)
        if(setCurrentTokens) setCurrentTokens(formattedList);
      })
      .catch((err) => {
        console.error("An error occurred while fetching the token list.", err);
        setTokenResponse(null);
      });
  }
}


export function formatTokenList(
  tokenResponse: { tokens: { symbol: string }[] },
  otherToken: any
) {
  const tokenList = tokenResponse.tokens.filter(
    (t) => t.symbol !== otherToken
  );
  const oceanToken = tokenList.pop();
  tokenList.splice(0, 0, oceanToken || { symbol: "OCEAN" });
  return tokenList;
}
