import { percOf } from "./equate";
import { TokenDetails } from "@dataxfi/datax.js/dist/Ocean";
import { removeBgLoadingState, bgLoadingStates } from "../context/GlobalState";
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
export async function getAllStakedPools(accountId: string, ocean: any) {
  const poolList = await ocean.getAllStakedPools(accountId);
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
}

/**
 * Manages all states related to all and current pool information by calling ocean functions.
 *  
 * @returns void | caught error
 */

export default function setPoolDataFromOcean({
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
}) {
  console.log(accountId)
  getAllStakedPools(accountId, ocean)
    .then(async (res: any) => {
      const settledArr: any = await Promise.allSettled(res);
      const allStakedPools = settledArr.map(
        (promise: PromiseSettledResult<PoolData>) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return promise.value;
        }
      );
      if (
        allStakedPools.length > 0
      ) {
        setAllStakedPools(allStakedPools);
        setLocalPoolDataStorage(allStakedPools, chainId);
        if (poolAddress && setCurrentStakePool) {
          const pool = allStakedPools.find(
            (pool: PoolData) => pool.address === poolAddress
          );
          setCurrentStakePool(pool);
        }
      } else if (allStakedPools.length === 0) {
        setNoStakedPools(true);
      }
      if (setLoading) setLoading(false);
      if (setBgLoading) {
          setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.allStakedPools))
      }
    })
    .catch((e: any) => {
      console.error(e);
      return e
    });
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
