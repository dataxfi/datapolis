import { percOf } from "./equate";
import { PoolData } from "../context/GlobalState";

export default async function getAllStakedPools(accountId: string, ocean: any) {
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
        const yourPoolShare =  percOf(shares, totalPoolShares)  ;
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

  export function setLocalStorage(allStakedPools: PoolData[]) {
    const key = `allStakedPools@${allStakedPools[0].accountId.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(allStakedPools));
    return;
  }

  export function getLocalPoolData(accountId: string){
    const lowerCaseId = accountId.toLowerCase()
    return localStorage.getItem(`allStakedPools@${lowerCaseId}`)
  }