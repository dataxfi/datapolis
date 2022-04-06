import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../context/GlobalState";
import { Config, Ocean, TokenList } from "@dataxfi/datax.js";
// import { TokenList as TList } from "@uniswap/token-lists";
import { ITList, ITokenInfo } from "@dataxfi/datax.js";
import Web3 from "web3";
import axios from "axios";
import { supportedChains } from "../utils/types";
export default function useTokenList({
  setLoading,
  setError,
}: {
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
    config,
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
    console.log("in useEffect", !!accountId , !!!dtTokenResponse , !!web3 , !!chainId);
    
    if (accountId && !dtTokenResponse && web3 && chainId) {
      console.log("fetching datatokens");
      
      if (setLoading) setLoading(true);
      getDtTokenList(web3, chainId)
        .then((res) => {
          if (res) {
            setDtTokenResponse(res);
            console.log("Datatoken List Response", res);            
            setDatatokens(res.tokens);
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
  }, [location, dtTokenResponse, web3, chainId, accountId]);

  useEffect(() => {
    if (!ERC20TokenResponse && chainId && config?.custom[chainId])
      try {
        getERC20TokenList(config, chainId).then((list) => {
          console.log("Token List Response", list);
          switch (chainId) {
            case "4":
              setERC20TokenResponse({ tokens: list as unknown as ITokenInfo[] } as ITList);
              setERC20Tokens(list as unknown as ITokenInfo[]);
              break;
            case "137":
              setERC20TokenResponse(list);
              setERC20Tokens(list.tokens);
              break;

            default:
              const tokens = [
                oceanTokens[chainId],
                ...list.tokens.filter((token) => String(token.chainId) === chainId),
              ];
              console.log(tokens);
              setERC20Tokens(tokens);
              setERC20TokenResponse({ ...list, tokens });
              // setERC20Tokens(list.tokens.filter((token) => String(token.chainId) === chainId));
              break;
          }
        });
      } catch (error) {
        console.error(error);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, ERC20TokenResponse, web3, chainId, config]);
}

async function getDtTokenList(web3: Web3, chainId: supportedChains): Promise<ITList> {
  const tokenList: TokenList = new TokenList(
    web3,
    "4",
    process.env.REACT_APP_PINATA_KEY || "",
    process.env.REACT_APP_PINATA_KEY || ""
  );

  return await tokenList.fetchPreparedTokenList(chainId ? Number(chainId) : 4);
}

async function getERC20TokenList(config: Config, chainId: supportedChains): Promise<ITList> {
  return await (
    await axios.get(config.custom[chainId].tokenList)
  ).data;
}

export async function getToken(
  web3: Web3,
  chainId: supportedChains,
  address: string,
  addressType: "pool" | "reserve"
): Promise<ITokenInfo | undefined> {
  const tokenList = await getDtTokenList(web3, chainId);
  if (addressType === "pool") {
    return tokenList.tokens.find((token) => token.pool?.toLowerCase() === address.toLowerCase());
  }
  return tokenList.tokens.find((token) => token.address.toLowerCase() === address.toLowerCase());
}

export async function getAllowance(tokenAddress: string, accountId: string, router: string, ocean: Ocean) {
  const allowance = await ocean.getAllowance(tokenAddress, accountId, router);
  // console.log("Allowance:", allowance);
  return allowance;
}

export const commonTokens = {
  "1": [
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "0x967da4048cD07aB37855c090aAF366e4ce1b9F48",
  ],
  "4": [
    "0x8967bcf84170c91b0d24d4302c2376283b0b3a07",
    "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
    "0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  ],
  "56": [
    "0xdce07662ca8ebc241316a15b611c89711414dd1a",
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    "0x55d398326f99059fF775485246999027B3197955",
  ],
  "137": [
    "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  ],
  "246": [
    "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
    "0x984E5dF7E6ed5450f0df08628F9EC4EB33d0f2b0",
    "0x387f7D8D3360588a9A0B417F6C5DaAe64450942e",
  ],
  "1285": [
    "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE",
    "0x98878B06940aE243284CA214f92Bb71a2b032B8A",
    "0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B",
  ],
};

const oceanTokens = {
  "1": {
    chainId: 1,
    address: "0x967da4048cD07aB37855c090aAF366e4ce1b9F48",
    symbol: "OCEAN",
    name: "Ocean Token",
    decimals: 18,
    logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
    tags: ["oceantoken"],
  },
  "4": {
    chainId: 4,
    address: "0x8967bcf84170c91b0d24d4302c2376283b0b3a07",
    symbol: "OCEAN",
    name: "Ocean Token",
    decimals: 18,
    logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
    tags: ["oceantoken"],
  },
  "56": {
    chainId: 56,
    address: "0xdce07662ca8ebc241316a15b611c89711414dd1a",
    symbol: "OCEAN",
    name: "Ocean Token",
    decimals: 18,
    logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
    tags: ["oceantoken"],
  },
  "137": {
    chainId: 137,
    address: "0x282d8efCe846A88B159800bd4130ad77443Fa1A1",
    symbol: "OCEAN",
    name: "Ocean Token",
    decimals: 18,
    logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
    tags: ["oceantoken"],
  },
  "246": {
    chainId: 246,
    address: "0x593122aae80a6fc3183b2ac0c4ab3336debee528",
    symbol: "OCEAN",
    name: "Ocean Token",
    decimals: 18,
    logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
    tags: ["oceantoken"],
  },
  "1285": {
    chainId: 1285,
    address: "0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae",
    symbol: "OCEAN",
    name: "Ocean Token",
    decimals: 18,
    logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
    tags: ["oceantoken"],
  },
};
