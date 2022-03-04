import { percOf } from "./equate";
import { Ocean } from "@dataxfi/datax.js";
import { ILiquidityPosition } from "./types";


/**
 * Timeout utility function for general purpose. Use this function if a timeout is needed to adhere to external request limitations, or any other needed use.
 *
 * @param ms
 * The time in ms needed to timeout before the next operation.
 * @returns
 */
export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function updateSingleStakePool({
  ocean,
  accountId,
  localData,
  setAllStakedPools,
  poolAddress,
}: {
  ocean: Ocean;
  accountId: string;
  localData: ILiquidityPosition[];
  setAllStakedPools: Function;
  poolAddress: string;
}) {
  poolAddress = poolAddress.toLowerCase();
  let updatedPool;
  const shares = await ocean.getMyPoolSharesForPool(poolAddress, accountId);
  const poolInfo = await getPoolInfoFromUserShares({
    ocean,
    poolAddress,
    shares,
  });
  updatedPool = { address: poolAddress, accountId, ...poolInfo, shares };

  if (localData) {
    const found = localData.findIndex((pool) => pool.address === poolAddress);
    if (found > -1) {
      //@ts-ignore
      localData.splice(found, 1, updatedPool);
    } else {
      //@ts-ignore
      localData.splice(0, 0, updatedPool);
    }
    setAllStakedPools(localData);
    setLocalPoolDataStorage(localData, ocean.networkId);
  } else {
    //@ts-ignore
    const allStakedPools: ILiquidityPosition[] = [updatedPool];
    setAllStakedPools(allStakedPools);
    setLocalPoolDataStorage(allStakedPools, ocean.networkId);
  }

  return updatedPool;
}

export async function updateUserStakePerPool({
  ocean,
  accountId,
  localData,
  setAllStakedPools,
}: {
  ocean: Ocean;
  accountId: string;
  localData: ILiquidityPosition[];
  setAllStakedPools: Function;
}) {
  let updatedData = localData.map(async (pool: ILiquidityPosition) => {
    const shares = await ocean.getMyPoolSharesForPool(pool.address, accountId);
    const { totalPoolShares, yourPoolSharePerc, dtAmount, oceanAmount } =
      await getPoolInfoFromUserShares({
        ocean,
        poolAddress: pool.address,
        shares,
      });

    return {
      ...pool,
      shares,
      totalPoolShares,
      yourPoolSharePerc,
      dtAmount,
      oceanAmount,
    };
  });

  const settledData = await Promise.all(updatedData);
  console.log(settledData);

  setAllStakedPools(settledData);
  setLocalPoolDataStorage(settledData, ocean.networkId);
  return updatedData;
}

/**
 * Gets LP details for shares in a pool for a particular user.
 * @param param0
 * @returns
 */

export async function getPoolInfoFromUserShares({
  ocean,
  poolAddress,
  shares,
}: {
  ocean: Ocean;
  poolAddress: string;
  shares: string;
}) {
  const { tokens } = await ocean.getPoolDetails(poolAddress);
  const token1 = await ocean.getTokenDetails(tokens[0]);
  const token2 = await ocean.getTokenDetails(tokens[1]);
  const totalPoolShares = await ocean.getTotalPoolShares(poolAddress);
  const yourPoolSharePerc = percOf(shares, totalPoolShares);
  const { dtAmount, oceanAmount } = await ocean.getTokensRemovedforPoolShares(
    poolAddress,
    String(totalPoolShares)
  );

  return {
    totalPoolShares,
    yourPoolSharePerc,
    dtAmount,
    oceanAmount,
    token1: {...token1, tokenAddress: tokens[0]},
    token2: {...token2, tokenAddress: tokens[1]},
  };
}


/**
 * Set local pool data storage.
 *
 * @param allStakedPools
 * @param chainId
 */

export function setLocalPoolDataStorage(
  allStakedPools: ILiquidityPosition[],
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
}: {
  localStoragePoolData: string;
  poolAddress: string;
  setAllStakedPools: Function;
  setCurrentStakePool: Function;
}) {
  const poolData: [] = JSON.parse(localStoragePoolData);
  setAllStakedPools(poolData);

  const found = poolData.find(
    (pool: { address: string }) => pool.address === poolAddress
  );

  if (found) {
    setCurrentStakePool(found);
    return true;
  }
}

