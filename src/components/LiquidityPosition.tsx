import { useContext, useEffect, useState } from "react";
import { bgLoadingStates, GlobalContext, INITIAL_TOKEN_STATE, removeBgLoadingState } from "../context/GlobalState";
import LiquidityPositionItem from "./LiquidityPositionItem";
import UserMessage from "./UserMessage";
import { getLocalPoolData, updateUserStakePerPool, updateSingleStakePool } from "../utils/stakedPoolsUtils";
import TokenModal from "./TokenModal";
import { MoonLoader } from "react-spinners";
import { IUserMessage, ILiquidityPosition } from "../utils/types";
import useLiquidityPos from "../hooks/useLiquidityPos";
const LiquidityPosition = () => {
  const {
    accountId,
    ocean,
    chainId,
    setLoading,
    allStakedPools,
    setAllStakedPools,
    bgLoading,
    setBgLoading,
    setSingleLiquidityPos,
    setToken1,
    setToken2,
  } = useContext(GlobalContext);
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string | IUserMessage | null>(
    "Dont see your tokens? Import a pool by name with the import button below."
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string | null>("importMessage");
  const [importPool, setImportPool] = useState<string>();
  useLiquidityPos(importPool, setImportPool);

  useEffect(() => {
    try {
      setToken1(INITIAL_TOKEN_STATE);
      setToken2(INITIAL_TOKEN_STATE);

      if (accountId) {
        let localData: any = getLocalPoolData(accountId, String(chainId));
        if (!ocean || !setLoading) return;
        if (localData && localData != null) {
          setBgLoading([...bgLoading, bgLoadingStates.allStakedPools]);
          localData = JSON.parse(localData);
          setNoStakedPools(false);
          console.log("Setting stake pool data from local.", localData);
          setAllStakedPools(localData);
          setLoading(false);
          setUserMessage(null);
        }
        if (localData) {
          console.log("Fetching stake pool data from local.");
          updateUserStakePerPool({
            ocean,
            accountId,
            localData,
            setAllStakedPools,
          }).then(() => {
            setBgLoading([
              ...removeBgLoadingState(bgLoading, bgLoadingStates.allStakedPools),
              ...removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData),
            ]);
            setLoading(false);
            setNoStakedPools(false);
            setUserMessage(null);
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean]);

  useEffect(() => {
    console.log("Currently loading in the background", bgLoading);
    if (!accountId && setLoading) {
      setUserMessage("Connect your wallet to see staked oceans.");
      setMessageId("connectWalletMessage");
      setLoading(false);
    } else if (noStakedPools) {
      setMessageId("noStakedPools");
      setUserMessage("You have no stake in any pools.");
    } else if (accountId && !allStakedPools) {
      setMessageId("importMessage");
      setUserMessage("Dont see your tokens? Import a pool by name with the import button below.");
    } else if (accountId && allStakedPools) {
      setUserMessage(null);
    }
  }, [noStakedPools, allStakedPools, accountId, bgLoading, setLoading]);

  return (
    <div className="absolute w-full h-full top-0 bottom-0  py-16 lg:py-28 px-2">
      <div className="flex flex-col justify-center h-full">
        <div
          id="lpModal"
          className="bg-black bg-opacity-90 w-full lg:w-107 p-2 max-h-full rounded-lg px-3 m-auto flex flex-col justify-center"
        >
          <div className="flex flex-row w-full m-auto">
            <div className="w-full flex pb-1 rounded-lg justify-between">
              <h2 className="text-2xl">Your staked pools</h2>
              {(bgLoading?.includes(bgLoadingStates.allStakedPools) ||
                bgLoading?.includes(bgLoadingStates.singlePoolData)) &&
              accountId ? (
                <MoonLoader color="white" size="25px" />
              ) : null}
            </div>
          </div>

          {userMessage ? (
            <div className="flex flex-row justify-center items-center p-4 lg:p-2 h-60 bg-trade-darkBlue bg-opacity-40 rounded-lg">
              <UserMessage
                id={messageId}
                message={userMessage}
                pulse={false}
                container={false}
                timeout={null}
                className="bg-opacity-60"
              />
            </div>
          ) : (
            <ul className={`${bgLoading ? " md:mt-1" : "md:mt-5"} pr-3 pl-3 overflow-scroll hm-hide-scrollbar`}>
              {allStakedPools?.map((pool: ILiquidityPosition, index: number) => (
                <LiquidityPositionItem singleLiqPosItem={pool} index={index} />
              ))}
            </ul>
          )}
          {showModal ? (
            <TokenModal
              onClick={(e: any) => {
                setShowModal(false);
                setImportPool(e.pool.toLowerCase());
              }}
              close={() => setShowModal(false)}
              otherToken="OCEAN"
            />
          ) : (
            <></>
          )}

          <div className="w-full flex justify-center">
            <div className="w-full pr-1">
              <button
                id="importStakeBtn"
                title="Import your stake information."
                disabled={accountId ? false : true}
                onClick={() => {
                  setShowModal(true);
                }}
                className={`p-2 w-full mt-2 txButton rounded-lg ${accountId ? "" : "cursor-not-allowed"}`}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPosition;
