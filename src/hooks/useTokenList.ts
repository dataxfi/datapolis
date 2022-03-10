import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../context/GlobalState";
import { Ocean, TokenList } from "@dataxfi/datax.js";
// import { TokenList as TList } from "@uniswap/token-lists";
import { ITList, ITokenInfo } from "@dataxfi/datax.js";
import Web3 from "web3";
import axios from "axios";
export default function useTokenList({
  otherToken,
  setLoading,
  setError,
}: {
  otherToken: string;
  setLoading?: Function;
  setError?: Function;
}) {
  const {
    location,
    chainId,
    web3,
    setDtTokenResponse,
    dtTokenResponse,
    setDatatokens,
    accountId,
    setERC20TokenResponse,
    setERC20Tokens,
    ERC20TokenResponse,
  } = useContext(GlobalContext);

  useEffect(() => {
    setDtTokenResponse(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const initialChain = useRef(chainId);
  useEffect(() => {
    if (chainId !== initialChain.current) {
      setDatatokens(undefined);
      setDtTokenResponse(undefined);
      setERC20TokenResponse(undefined);
      setERC20Tokens(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, setDatatokens, setDtTokenResponse]);

  useEffect(() => {
    if (accountId && !dtTokenResponse && web3 && chainId) {
      if (setLoading) setLoading(true);
      getDtTokenList(web3, chainId)
        .then((res) => {
          if (res) {
            setDtTokenResponse(res);
            console.log("Datatoken Token List Response:", res);
            //@ts-ignore
            const formattedList = formatTokenArray(res, otherToken, location);
            setDatatokens(formattedList);
          }
        })
        .catch((err: Error) => {
          if (err) setDtTokenResponse(undefined);
          console.error("An error occurred while fetching the token list.", err);
          if (setError) setError(true);
        })
        .finally(() => {
          if (setLoading) setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, otherToken, dtTokenResponse, web3, chainId]);

  useEffect(() => {
    if (!ERC20TokenResponse)
      getERC20TokenList().then((list) => {
        console.log("Token List Response", list);
        setERC20TokenResponse(list);
        setERC20Tokens(list.tokens);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, otherToken, ERC20TokenResponse, web3, chainId]);
}

async function getDtTokenList(web3: Web3, chainId: number): Promise<ITList> {
  const tokenList: TokenList = new TokenList(
    web3,
    "4",
    process.env.REACT_APP_PINATA_KEY || "",
    process.env.REACT_APP_PINATA_KEY || ""
  );

  return await tokenList.fetchPreparedTokenList(chainId ? chainId : 4);
}

async function getERC20TokenList(): Promise<ITList> {
  return await (
    await axios.get("https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokens.1inch.eth.link")
  ).data;
}

export async function getToken(
  web3: Web3,
  chainId: number,
  address: string,
  addressType: "pool" | "reserve"
): Promise<ITokenInfo | undefined> {
  const tokenList = await getDtTokenList(web3, chainId);
  if (addressType === "pool") {
    return tokenList.tokens.find((token) => token.pool.toLowerCase() === address.toLowerCase());
  }
  return tokenList.tokens.find((token) => token.address.toLowerCase() === address.toLowerCase());
}

export function formatTokenArray(
  dtTokenResponse: { tokens: ITokenInfo[] },
  otherToken: string,
  location: string
): ITokenInfo[] {
  let tokenList: ITokenInfo[] = dtTokenResponse.tokens;
  tokenList = dtTokenResponse.tokens.filter((t) => t.symbol !== otherToken);

  if (tokenList.length > 0) {
    //@ts-ignore
    const oceanToken: ITokenInfo = tokenList.pop();
    tokenList.splice(0, 0, oceanToken);
  }

  console.log(otherToken, tokenList);

  return tokenList;
}

export async function getAllowance(tokenAddress: string, accountId: string, router: string, ocean: Ocean) {
  const allowance = await ocean.getAllowance(tokenAddress, accountId, router);
  console.log("Allowance:", allowance);
  return allowance;
}
