import { useContext, useEffect, useState } from "react";
import { GlobalContext, PoolData } from "../context/GlobalState";
import LiquidityPositionItem from "./LiquidityPositionItem";
import YellowXLoader from "../assets/YellowXLoader.gif";
import UserMessageModal from "./UserMessageModal";
import getAllStakedPools, {
  setLocalStorage,
  getLocalPoolData,
} from "../utils/getAllStakedPools";

const LiquidityPosition = () => {
  const {
    accountId,
    ocean,
    loading,
    setLoading,
    allStakedPools,
    setAllStakedPools,
  } = useContext(GlobalContext);
  const [bgLoading, setBgLoading] = useState<boolean>(false);
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setBgLoading(true);
    //setAllStakedPools(null);

    let localData;

    try {
      if (accountId) {
        localData = getLocalPoolData(accountId);
        if (localData && localData != null) {
          setNoStakedPools(false);
          setAllStakedPools(JSON.parse(localData));
          setLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
    }

    if (ocean && accountId) {
      setBgLoading(true);
      getAllStakedPools(accountId, ocean)
        .then(async (res) => {
          const settledArr = await Promise.allSettled(res);
          const allStakedPools = settledArr.map(
            (promise: PromiseSettledResult<PoolData>) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              return promise.value;
            }
            );
            console.log("All staked pools: ",allStakedPools)
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

  return !accountId ? (
    UserMessageModal({
      message: "Connect your wallet to see staked oceans.",
      pulse: false,
      container: true,
      timeout: null,
    })
  ) : noStakedPools ? (
    UserMessageModal({
      message: `You have no stake in any pools, check out StakeX to buy stake!`,
      pulse: false,
      container: true,
      timeout: null,
    })
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
        {allStakedPools?.map((pool: PoolData, index: number) => (
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
