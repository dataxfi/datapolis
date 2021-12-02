import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { PoolData } from "../utils/useAllStakedPools";
import LiquidityPositionItem from "./LiquidityPositionItem";
import YellowXLoader from "../assets/YellowXLoader.gif";
import UserMessageModal from "./UserMessageModal";
import setStakePoolStates, {
  getLocalPoolData,
} from "../utils/useAllStakedPools";

const LiquidityPosition = () => {
  const {
    accountId,
    ocean,
    chainId,
    loading,
    setLoading,
    allStakedPools,
    setAllStakedPools,
    bgLoading, 
    setBgLoading
  } = useContext(GlobalContext);
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setBgLoading({status:true, operation:"stake"});
    setAllStakedPools(null);
    
    if (ocean && accountId) {
      setBgLoading({status:true, operation:"stake"})
      setStakePoolStates({
        accountId,
        ocean,
        chainId,
        setAllStakedPools,
        setNoStakedPools,
        setLoading,
        setBgLoading,
      });
    }

    try {
      if (accountId) {
        const localData = getLocalPoolData(accountId, chainId);
        if (localData && localData != null) {
          setNoStakedPools(false);
          setAllStakedPools(JSON.parse(localData));
          setLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
    }

    if (!accountId) setLoading(false);
            // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean]);

  return !accountId ? (
    <UserMessageModal
      message="Connect your wallet to see staked oceans."
      pulse={false}
      container={true}
      timeout={null}
    />
  ) : noStakedPools ? (
    <UserMessageModal
      message="You have no stake in any pools, check out StakeX to buy stake!"
      pulse={false}
      container={true}
      timeout={null}
    />
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
      {bgLoading.status ? (
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
