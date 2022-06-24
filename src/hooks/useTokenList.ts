import { useContext, useEffect, useRef } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { Config, TokenList, ITList, ITokenInfo, Stake } from '@dataxfi/datax.js';
import Web3 from 'web3';
import axios from 'axios';
import { supportedChains } from '../utils/types';
export default function useTokenList({ setLoading, setError }: { setLoading?: Function; setError?: Function }) {
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
    // showTokenModal,
  } = useContext(GlobalContext);

  useEffect(() => {
    setDtTokenResponse(undefined);
  }, [location]);

  const initialChain = useRef(chainId);
  useEffect(() => {
    if (chainId !== initialChain.current) {
      setDatatokens(undefined);
      setDtTokenResponse(undefined);
      setERC20TokenResponse(undefined);
      setERC20Tokens(undefined);
    }
  }, [chainId, setDatatokens, setDtTokenResponse]);

  useEffect(() => {
    if (accountId && !dtTokenResponse && web3 && chainId) {
      if (setLoading) setLoading(true);
      getDtTokenList(web3, chainId)
        .then((res) => {
          if (res) {
            setDtTokenResponse(res);
            if (location !== '/trade')
              setDatatokens(
                res.tokens.filter((token) => token.isFRE === false).sort((a, b) => a.symbol.localeCompare(b.symbol))
              );
          }
        })
        .catch((err: Error) => {
          if (err) setDtTokenResponse(undefined);
          console.error('An error occurred while fetching the token list.', err);
          if (setError) setError(true);
        })
        .finally(() => {
          if (setLoading) setLoading(false);
        });
    }
  }, [location, dtTokenResponse, web3, chainId, accountId]);

  function setERC20List(list: ITList) {
    setERC20Tokens(list.tokens);
    setERC20TokenResponse(list);
  }

  useEffect(() => {
    if (!ERC20TokenResponse && chainId && config?.custom && web3) {
      console.log("Fetching erc20 list")
      getERC20TokenList(config, chainId)
        .then((list) => {
          console.log(list);
          
          if (!list) return;
          console.log("Setting ERC20List");
          
          setERC20List(list);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [location, ERC20TokenResponse, web3, chainId, config]);
}

async function getDtTokenList(web3: Web3, chainId: supportedChains): Promise<ITList | undefined> {
  const tokenList: TokenList = new TokenList(
    web3,
    '4',
    process.env.REACT_APP_PINATA_KEY || '',
    process.env.REACT_APP_PINATA_KEY || ''
  );

  try {
    return await tokenList.fetchPreparedTokenList(Number(chainId));
  } catch (error) {
    console.error(error);
  }
}

async function getERC20TokenList(config: Config, chainId: supportedChains): Promise<ITList | undefined> {
  try {
    const regularList = await axios.get(config.custom.tokenList);
    console.log(regularList);
    let iTlistWithOcean;
    let listWithOcean;
    if (chainId === '4') {
      listWithOcean = [oceanTokens[4], ...regularList.data];
      iTlistWithOcean = {
        name: 'Rinkeby token list',
        timestamp: '',
        version: {
          major: 0,
          minor: 0,
          patch: 0,
        },
        tags: {},
        logoURI: '',
        keywords: ['default'],
        tokens: listWithOcean,
      };
    } else {
      const listFilteredByChain = regularList.data.tokens.filter(
        (token: ITokenInfo) => String(token.chainId) === chainId
      );

      const listHasOcean = listFilteredByChain.find(
        (token: ITokenInfo) => token.address.toLowerCase() === oceanTokens[chainId].address.toLowerCase()
      );

      !listHasOcean
        ? (iTlistWithOcean = { ...regularList.data, tokens: [oceanTokens[chainId], ...regularList.data.tokens] })
        : (iTlistWithOcean = { ...regularList.data, tokens: listFilteredByChain });
    }

    return iTlistWithOcean;
  } catch (error) {
    console.error(error);
  }
}

export async function getToken(
  web3: Web3,
  chainId: supportedChains,
  address: string,
  addressType: 'pool' | 'exchange',
  config: Config
): Promise<ITokenInfo | undefined> {
  try {
    const dtList = await getDtTokenList(web3, chainId);
    const erc20List = await getERC20TokenList(config, chainId);

    if (addressType === 'pool') {
      return dtList?.tokens.find((token) => {
        if (token.pools[0]) return token.pools[0].id.toLowerCase() === address.toLowerCase();
      });
    }

    const regSearch = (token: ITokenInfo) => token.address.toLowerCase() === address.toLowerCase();
    let found = erc20List?.tokens?.find((token: ITokenInfo) => token.address.toLowerCase() === address.toLowerCase());
    if (found) return found;
    return dtList?.tokens.find(regSearch);
  } catch (error) {
    console.error(error);
  }
}

export async function getAllowance(tokenAddress: string, accountId: string, spender: string, stake: Stake) {
  const allowance = await stake.getAllowance(tokenAddress, accountId, spender);
  // console.log("Allowance:", allowance);
  return allowance;
}

export const commonTokens = {
  1: [
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
  ],
  4: [
    '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
    '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
    '0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  ],
  56: [
    '0xdce07662ca8ebc241316a15b611c89711414dd1a',
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    '0x55d398326f99059fF775485246999027B3197955',
  ],
  137: [
    '0x282d8efCe846A88B159800bd4130ad77443Fa1A1',
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  ],
  246: [
    '0x593122aae80a6fc3183b2ac0c4ab3336debee528',
    '0x984E5dF7E6ed5450f0df08628F9EC4EB33d0f2b0',
    '0x387f7D8D3360588a9A0B417F6C5DaAe64450942e',
  ],
  1285: [
    '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE',
    '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
    '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
  ],
};

export const oceanTokens = {
  1: {
    chainId: 1,
    address: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
    symbol: 'OCEAN',
    name: 'Ocean Token',
    decimals: 18,
    logoURI: 'https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY',
    tags: ['oceantoken'],
  },
  4: {
    chainId: 4,
    address: '0x8967bcf84170c91b0d24d4302c2376283b0b3a07',
    symbol: 'OCEAN',
    name: 'Ocean Token',
    decimals: 18,
    logoURI: 'https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY',
    tags: ['oceantoken'],
  },
  56: {
    chainId: 56,
    address: '0xdce07662ca8ebc241316a15b611c89711414dd1a',
    symbol: 'OCEAN',
    name: 'Ocean Token',
    decimals: 18,
    logoURI: 'https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY',
    tags: ['oceantoken'],
  },
  137: {
    chainId: 137,
    address: '0x282d8efCe846A88B159800bd4130ad77443Fa1A1',
    symbol: 'OCEAN',
    name: 'Ocean Token',
    decimals: 18,
    logoURI: 'https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY',
    tags: ['oceantoken'],
  },
  246: {
    chainId: 246,
    address: '0x593122aae80a6fc3183b2ac0c4ab3336debee528',
    symbol: 'OCEAN',
    name: 'Ocean Token',
    decimals: 18,
    logoURI: 'https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY',
    tags: ['oceantoken'],
  },
  1285: {
    chainId: 1285,
    address: '0x99c409e5f62e4bd2ac142f17cafb6810b8f0baae',
    symbol: 'OCEAN',
    name: 'Ocean Token',
    decimals: 18,
    logoURI: 'https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY',
    tags: ['oceantoken'],
  },
};
