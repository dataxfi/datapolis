import { percOf } from "./equate";
import { TokenDetails } from "@dataxfi/datax.js/dist/Ocean";

export interface PoolData {
  accountId: string;
  address: string;
  token1: TokenDetails;
  token2: TokenDetails;
  shares: string;
  dtAmount?: string;
  oceanAmount?: string;
  totalPoolShares?: string;
  yourPoolShare?: string;
}

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
      const yourPoolShare = percOf(shares, totalPoolShares);
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
        yourPoolShare,
        accountId,
      };
    }
  );
  return userPoolData;
}

export default function setStakePoolStates({
  accountId,
  ocean,
  chainId,
  poolAddress,
  setBgLoading,
  setAllStakedPools,
  setCurrentStakePool,
  setNoStakedPools,
  setLoading,
}: {
  accountId: string;
  ocean: any;
  chainId: string | number
  poolAddress?: string | null;
  setBgLoading?: Function;
  setAllStakedPools: Function;
  setCurrentStakePool?: Function;
  setNoStakedPools: Function;
  setLoading?: Function;
}) {
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
        allStakedPools.length > 0 &&
        accountId === allStakedPools[0].accountId
      ) {
        setAllStakedPools(allStakedPools);
        setLocalStorage(allStakedPools, chainId);
        if(poolAddress && setCurrentStakePool) {
          const pool = allStakedPools.find(
            (pool: PoolData) => pool.address === poolAddress
          );
          setCurrentStakePool(pool);
        }
      } else if (allStakedPools.length === 0) {
        setNoStakedPools(true);
      }
      if(setLoading) setLoading(false);
      if(setBgLoading) setBgLoading({status:false, operation:null})
    })
    .catch((e: any) => {
      console.error(e);
    });
}

export function setLocalStorage(allStakedPools: PoolData[], chainId: string | number) {
  const key = `allStakedPools@${chainId}@${allStakedPools[0].accountId.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(allStakedPools));
}

export function getLocalPoolData(accountId: string, chainId: string | number) {
  const lowerCaseId = accountId.toLowerCase();
  return localStorage.getItem(`allStakedPools@${chainId}@${lowerCaseId}`);
}
