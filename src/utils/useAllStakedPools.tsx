import { percOf } from "./equate";
import { TokenDetails } from "@dataxfi/datax.js/dist/Ocean";
import { removeBgLoadingState, bgLoadingStates } from "../context/GlobalState";
import { PoolShare } from "@dataxfi/datax.js/dist/Ocean";
import Web3 from "web3";

export interface PoolData {
  //user wallet ID (hash)
  accountId: string;
  //pool address
  address: string;
  //tokens in pool
  token1: TokenDetails;
  token2: TokenDetails;
  //the amount of shares you own
  shares: string;
  //total dt in pool
  dtAmount?: string;
  //total ocean in pool
  oceanAmount?: string;
  //total shares in pool
  totalPoolShares?: string;
  //you share percentage in pool
  yourPoolSharePerc?: string;
}

/**
 * Gets all stake pool data for a parcticular accountId. Ocean instance already knows the current chain.
 *
 * @param accountId
 * current accountId
 * @param ocean
 * ocean instance set in global state
 * @returns <PoolData>[]
 */

export async function getAllStakedPools({
  accountId,
  fromBlock,
  ocean,
  toBlock,
}: {
  accountId: string;
  fromBlock: number;
  ocean: any;
  toBlock: number;
}) {
  try {
    const poolList = await ocean.getAllStakedPools(
      accountId,
      fromBlock,
      toBlock
    );
    if (!poolList || poolList.length === 0) return poolList;
    console.log("Recieved response from oceean.allStakedPools", poolList);
    const userPoolData: Promise<PoolData>[] = poolList.map(
      async ({
        shares,
        poolAddress,
      }: {
        shares: string;
        poolAddress: string;
      }) => {
        const address = poolAddress;
        const { tokens } = await ocean.getPoolDetails(address);
        const token1 = await ocean.getTokenDetails(tokens[0]);
        const token2 = await ocean.getTokenDetails(tokens[1]);
        const totalPoolShares = await ocean.getTotalPoolShares(poolAddress);
        const yourPoolSharePerc = percOf(shares, totalPoolShares);
        const { dtAmount, oceanAmount } =
          await ocean.getTokensRemovedforPoolShares(
            address,
            String(totalPoolShares)
          );

        return {
          address,
          token1,
          token2,
          shares,
          dtAmount,
          oceanAmount,
          totalPoolShares,
          yourPoolSharePerc,
          accountId,
        };
      }
    );
    return userPoolData;
  } catch (error: any) {
    console.log("Caught Error in call to ocean.getAllStakedPools")
    console.error(error);
    throw new Error(error)
  }
}

/**
 * Manages all states related to all and current pool information by calling ocean functions.
 *
 * @returns void | caught error
 */

export default async function setPoolDataFromOcean({
  accountId,
  ocean,
  chainId,
  poolAddress,
  setBgLoading,
  setAllStakedPools,
  setCurrentStakePool,
  setNoStakedPools,
  bgLoading,
  setLoading,
  config,
  web3,
  allStakedPools,
  setError,
}: {
  accountId: string;
  ocean: any;
  chainId: string | number;
  poolAddress?: string | null;
  setBgLoading?: Function;
  setAllStakedPools: Function;
  setCurrentStakePool?: Function;
  setNoStakedPools: Function;
  bgLoading: string[];
  setLoading?: Function;
  config: any;
  web3: Web3;
  allStakedPools: PoolData[];
  setError?: Function;
}) {
  //recursively call getAllstaked pools
  //continousouly update the state upon response

  const firstBlock: number = config.default.startBlock || 0;
  console.log("First block is:", firstBlock);
  let toBlock: number = await web3.eth.getBlockNumber();
  console.log("Latest block is:", toBlock);
  let fromBlock = toBlock - 5000;
  let fetchCount: number = 0;
  const initalLocation = window.location.href;
  let fetchedStakePools: PoolData[] = [];
  let interval: number;
  let blockRange: number;
  let promises: any = [];

  switch (chainId) {
    case 56:
      interval = 1500;
      blockRange = 5000;
      break;
    default:
      interval = 0;
      blockRange = 5000;
      break;
  }

  let internalError = false;

  function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  if (firstBlock)
    while (
      firstBlock < fromBlock &&
      initalLocation === window.location.href &&
      !internalError
    ) {
      console.log(`Fetching from ${fromBlock} to ${toBlock}`);
      promises.push(
        getAllStakedPools({ accountId, fromBlock, toBlock, ocean })
          .then(async (res: any) => {
            if (!res || res.length === 0) return;
            console.log(
              "Recieve response from getAllStakedPools in dapp:",
              res
            );
            const settledArr: any = await Promise.allSettled(res);
            const newData = settledArr.map(
              (promise: PromiseSettledResult<PoolData>) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return promise.value;
              }
            );
            if (newData.length > 0) {
              fetchedStakePools = [...fetchedStakePools, ...newData];
              console.log("Fetched stake pools:", fetchedStakePools);
              setAllStakedPools(fetchedStakePools);
              setLocalPoolDataStorage(fetchedStakePools, chainId);
            }
          })
          .catch((e: any) => {
            console.log("Error Caught in call to getAllStakedPools in dapp: ")
            console.error(e);
            internalError = true;
            if (setError)
              setError({
                message:
                  "We couldnt retrieve your pool share information. Reach out on our discord for support!",
                link: "https://discord.com/invite/b974xHrUGV",
                type:"error"
              });
            //throw new Error(e);
          })
      );
      fromBlock = fromBlock - blockRange;
      toBlock = toBlock - blockRange;
      fetchCount++;
      //call timeout function to delay next loop
      if (interval) await Promise.resolve(timeout(interval));
      //if (chainId === 56) stop = false
    }
  console.log("Final fetch count:", fetchCount);

  console.log(promises);
  await Promise.all(promises);
  console.log("All promises settled");

  if (!fetchedStakePools.length && !allStakedPools && !internalError) {
    setNoStakedPools(true);
  }

  if (poolAddress && setCurrentStakePool) {
    console.log("Current pool and setCurrentStakePool function found, setting currentStakePool", poolAddress, setCurrentStakePool);
    const pool = fetchedStakePools.find(
      (pool: PoolData) => pool.address === poolAddress
    );
    setCurrentStakePool(pool);
  }

  if (setBgLoading) {
    setBgLoading(
      removeBgLoadingState(bgLoading, bgLoadingStates.allStakedPools)
    );
  }
  if (setLoading) setLoading(false);
}

/**
 * Set local pool data storage.
 *
 * @param allStakedPools
 * @param chainId
 */

export function setLocalPoolDataStorage(
  allStakedPools: PoolData[],
  chainId: string | number
) {
  const key = `allStakedPools@${chainId}@${allStakedPools[0].accountId.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(allStakedPools));
}

/**
 * Get local pool data storage.
 *
 * @param accountId
 * @param chainId
 * @returns
 */
export function getLocalPoolData(accountId: string, chainId: string | number) {
  const lowerCaseId = accountId.toLowerCase();
  return localStorage.getItem(`allStakedPools@${chainId}@${lowerCaseId}`);
}

/**
 * Attempts to find pool data for given pool address from given local pool data. Sets proper states if data is found.
 * Sets allStakedPools state with given pool data regardless.
 *
 * @param param0
 * @returns Boolean (Whether single local data was found and set.)
 */
export function setPoolDataFromLocal({
  localStoragePoolData,
  poolAddress,
  setAllStakedPools,
  setCurrentStakePool,
  setBgLoading,
  bgLoading,
}: {
  localStoragePoolData: string;
  poolAddress: string;
  setAllStakedPools: Function;
  setCurrentStakePool: Function;
  setBgLoading: Function;
  bgLoading: [];
}) {
  const poolData: [] = JSON.parse(localStoragePoolData);
  setAllStakedPools(poolData);

  const found = poolData.find(
    (pool: { address: string }) => pool.address === poolAddress
  );

  if (found) {
    setCurrentStakePool(found);
    setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePool));
    return true;
  }
}
