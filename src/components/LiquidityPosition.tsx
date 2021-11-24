import React, { useContext, useEffect, useState } from "react";
import { GlobalContext, PoolData } from "../context/GlobalState";
import LiquidityPositionItem from "./LiquidityPositionItem";
import YellowXLoader from "../assets/YellowXLoader.gif";


function setLocalStorage(allStakedPools: PoolData[]) {
  const key = `allStakedPools@${allStakedPools[0].accountId.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(allStakedPools));
  return;
}

const LiquidityPosition = () => {
  const { accountId, ocean, loading, setLoading, allStakedPools, setAllStakedPools } = useContext(GlobalContext); 
  const [bgLoading, setBgLoading] = useState<boolean>(false);
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);
  async function getAllStakedPools(accountId: string) {
    setBgLoading(true);
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
        const yourPoolShare = Number(shares) / Number(totalPoolShares);
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

  useEffect(() => {
    setLoading(true);
    setBgLoading(true);
    setAllStakedPools(null);

    let localData;

    try {
      if(accountId){
          localData = localStorage.getItem(`allStakedPools@${accountId.toLowerCase()}`);
          if (localData && localData != null) {
            setAllStakedPools(JSON.parse(localData));
            setLoading(false);
          }
      }
    } catch (error) {
      console.error(error);
    }

    if (ocean && accountId) {
      getAllStakedPools(accountId)
        .then(async (res) => {
          const settledArr = await Promise.allSettled(res);
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
            setLocalStorage(allStakedPools);
          } else if (allStakedPools.length === 0) {
            setNoStakedPools(true);
          }
          setLoading(false);
          setBgLoading(false);
        })
        .catch((e) => {
          console.error(e);
        });
    }

    if (!accountId) setLoading(false);
  }, [accountId]);

  function messageDiv(message: string) {
    return (
      <div className="w-full h-4/5 flex flex-row justify-center p-4">
        <div className="h-1/3 text-center bg-gray-900 px-10 py-20 rounded-lg self-center">
          {message}
        </div>
      </div>
    );
  }

  return !accountId ? (
    messageDiv("Connect your wallet to see your liquidity position.")
  ) : noStakedPools ? (
    messageDiv(`You have no stake in any pools, check out StakeX to buy stake!`)
  ) : loading ? (
    <div className="flex flex-col justify-center text center align-middle items-center h-4/6">
      <img
        src={YellowXLoader}
        alt="DataX Animation"
        width="150px"
        className="pb-3"
      />
      Scanning the entire chain, this will take about 20 seconds.
    </div>
  ) : (
    <div>
      {bgLoading ? (
        <div className="text-xs md:text-base pt-5 w-full text-center px-3">
          loading most recent information in the background . . .
        </div>
      ) : null}
      <ul className={`${bgLoading ? " md:mt-1" : "md:mt-5"} pr-3 pl-3 pt-5`}>
        {allStakedPools?.map((pool: PoolData, index:number) => (
          <LiquidityPositionItem
            pool={pool}
            index={index}
            length={allStakedPools.length}
          />
        ))}
      </ul>
    </div>
  );
};

export default LiquidityPosition;
