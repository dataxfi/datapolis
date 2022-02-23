import { useContext, useEffect, useState } from "react";
import { bgLoadingStates, GlobalContext, removeBgLoadingState } from "../context/GlobalState";
import LiquidityPositionItem from "./LiquidityPositionItem";
import UserMessage from "./UserMessage";
import {
  setPoolDataFromOcean,
  getLocalPoolData,
  updateUserStakePerPool,
  updateSingleStakePool,
} from "../utils/stakedPoolsUtils";
import TokenModal from "./TokenModal";
import { MoonLoader } from "react-spinners";
import useWatchLocation from "../hooks/useWatchLocation";
import { IUserMessage, IPoolData } from "../utils/types";
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
    config,
    web3,
    stakeFetchTimeout,
    setStakeFetchTimeout,
    setCurrentStakePool,
  } = useContext(GlobalContext);
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string | IUserMessage | null>(
    "Dont see your tokens? Import a pool by name with the import button below."
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string | null>("importMessage");

  useWatchLocation();

  useEffect(() => {
    if (!setAllStakedPools || !setCurrentStakePool) return;
    setAllStakedPools(null);
    setCurrentStakePool(null);
  }, [setAllStakedPools, setCurrentStakePool]);

  useEffect(() => {
    try {
      if (accountId) {
        let localData: any = getLocalPoolData(accountId, String(chainId));
        if (!Array.isArray(bgLoading) || !setBgLoading || !setAllStakedPools || !ocean || !setLoading) return;
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
      //, or scan the entire blockchain.
    } else if (accountId && allStakedPools) {
      setUserMessage(null);
    }
  }, [noStakedPools, allStakedPools, accountId, bgLoading, setLoading]);

  function scanData() {
    try {
      if (ocean && accountId) {
        // consider a conditional that checks if stake is already loading or using a set for bgLoading
        if (
          chainId &&
          setAllStakedPools &&
          bgLoading &&
          web3 &&
          allStakedPools &&
          stakeFetchTimeout &&
          setStakeFetchTimeout
        )
          setPoolDataFromOcean({
            accountId,
            ocean,
            chainId,
            setAllStakedPools,
            setNoStakedPools,
            setLoading,
            bgLoading,
            setBgLoading,
            config,
            web3,
            allStakedPools,
            setError: setUserMessage,
            stakeFetchTimeout,
            setStakeFetchTimeout,
          });
        setUserMessage(null);
      }
    } catch (error) {
      setUserMessage({
        message: "We couldnt retrieve your pool share information.",
        link: {
          href: "https://discord.com/invite/b974xHrUGV",
          desc: "Reach out on our discord for support!",
        },
        type: "error",
      });
    }
  }

  function importData(poolAddress: string) {
    setShowModal(false);
    if (setLoading && setBgLoading && bgLoading && ocean && accountId && setAllStakedPools && allStakedPools) {
      setBgLoading([...bgLoading, bgLoadingStates.singlePoolData]);
      updateSingleStakePool({
        ocean,
        accountId,
        setAllStakedPools,
        poolAddress,
        localData: allStakedPools,
      }).then(() => {
        setLoading(false);
        setUserMessage(null);
        setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData));
      });
    }
  }

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
              {allStakedPools?.map((pool: IPoolData, index: number) => (
                <LiquidityPositionItem pool={pool} index={index} />
              ))}
            </ul>
          )}
          {showModal ? (
            <TokenModal
              onClick={(e: any) => {
                importData(e.pool);
              }}
              close={() => setShowModal(false)}
              otherToken="OCEAN"
            />
          ) : (
            <></>
          )}
          {/* <div className="flex flex-row w-full m-auto"> */}
          {/* <div className="max-w-2xl w-full py-2 bg-black"> */}
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
            {/* <div className="w-1/2 pl-1">
                  <button
                  id="scanStakeBtn"
                    title="Scan for your stake information."
                    disabled={accountId ? false : true}
                    onClick={() => {
                      scanData();
                    }}
                    className={`p-3 w-full  bg-primary-600 rounded ${
                      accountId ? "bg-primary-600 text-white hover:bg-primary-500" : "bg-primary-800 text-gray-500"
                    }`}
                  >
                    Scan
                  </button>
                </div> */}
          </div>
        </div>
      </div>
      {/* </div> */}
      {/* </div> */}
    </div>
  );
};

export default LiquidityPosition;
