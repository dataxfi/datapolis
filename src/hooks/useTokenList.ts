import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../context/GlobalState";
import { Ocean, TokenList } from "@dataxfi/datax.js";
// import { TokenList as TList } from "@uniswap/token-lists";
import { ITokenInfo, ITokenList } from "../utils/types";

export default function useTokenList({
  otherToken,
  setLoading,
  setError,
}: {
  otherToken: string;
  setLoading?: Function;
  setError?: Function;
}) {
  const { location, chainId, web3, setTokenResponse, tokenResponse, setTokenModalArray, accountId } =
    useContext(GlobalContext);

  useEffect(() => {
    setTokenResponse(undefined);
  }, [location]);

  const initialChain = useRef(chainId);
  useEffect(() => {
    if (setTokenModalArray && setTokenResponse && chainId !== initialChain.current) {
      setTokenModalArray(undefined);
      setTokenResponse(undefined);
    }
  }, [chainId, setTokenModalArray, setTokenResponse]);

  useEffect(() => {
    if (accountId && !tokenResponse) {
      if (setLoading) setLoading(true);
      const tokenList: TokenList = new TokenList(
        web3,
        "4",
        process.env.REACT_APP_PINATA_KEY || "",
        process.env.REACT_APP_PINATA_KEY || ""
      );

      tokenList
        .fetchPreparedTokenList(chainId ? chainId : 4)
        .then((res) => {
          if (res && setTokenResponse && setTokenModalArray) {
            setTokenResponse(res);
            console.log("Token List Response:", res);
            //@ts-ignore
            const formattedList = formatTokenArray(res, otherToken, location);
            console.log(formattedList);
            setTokenModalArray(formattedList);
          }
        })
        .catch((err: Error) => {
          if (err && setTokenResponse) setTokenResponse(undefined);
          console.error("An error occurred while fetching the token list.", err);
          if (setError) setError(true);
        })
        .finally(() => {
          if (setLoading) setLoading(false);
        });
    }
  }, [location, otherToken, setTokenModalArray, tokenResponse, setTokenResponse]);
}

export function formatTokenArray(
  tokenResponse: { tokens: ITokenInfo[] },
  otherToken: any,
  location: string
): ITokenInfo[] {
  let tokenList: ITokenInfo[] = tokenResponse.tokens;
  if (location === "/trade") {
    tokenList = tokenResponse.tokens.filter((t) => t.symbol !== otherToken);
  } else {
    tokenList = tokenResponse.tokens.filter((t) => {
      if (t.symbol !== otherToken && t.pool) return t;
    });
  }
  if (tokenList.length > 0) {
    //@ts-ignore
    const oceanToken: ITokenInfo = tokenList.pop();
    tokenList.splice(0, 0, oceanToken);
  }
  return tokenList;
}

export async function getAllowance(tokenAddress: string, accountId: string, router: string, ocean: Ocean) {
  return await ocean.getAllowance(tokenAddress, accountId, router);
}
