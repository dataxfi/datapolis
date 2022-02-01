import { useContext, useEffect, useState } from "react";
import { bgLoadingStates, GlobalContext, removeBgLoadingState } from "../context/GlobalState";
import LiquidityPositionItem from "./LiquidityPositionItem";
import UserMessageModal, { userMessage } from "./UserMessageModal";
import {
  setPoolDataFromOcean,
  getLocalPoolData,
  updateUserStakePerPool,
  PoolData,
  updateSingleStakePool,
} from "../utils/stakedPoolsUtils";
import TokenModal from "./TokenModal";
import { PulseLoader } from "react-spinners";
import useBgToggler from "../hooks/useBgToggler";
import Footer from "./Footer";

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
  const [userMessage, setUserMessage] = useState<string | userMessage | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [messageId, setMessageId] = useState<string | null>(null);

  useBgToggler();

  useEffect(() => {
    setAllStakedPools(null);
    setCurrentStakePool(null);
  }, [setAllStakedPools, setCurrentStakePool]);

  useEffect(() => {
    try {
      if (accountId && !allStakedPools) {
        let localData: any = getLocalPoolData(accountId, chainId);
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
            setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.allStakedPools));
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
  }, [accountId, ocean, allStakedPools]);

  useEffect(() => {
    console.log("Currently loading in the background", bgLoading);
    if (!accountId) {
      setUserMessage("Connect your wallet to see staked oceans.");
      setMessageId("connectWalletMessage");
      setLoading(false);
    } else if (noStakedPools) {
      setMessageId("noStakedPools");
      setUserMessage("You have no stake in any pools, check out StakeX to buy stake!");
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

  return (
      <div className="absolute w-full h-full overflow-scroll hm-hide-scrollbar mt-18">
          <div className="flex flex-col m-auto ">
            <div id="lpModal" className="bg-black bg-opacity-90 w-107 p-2 rounded-lg px-3 m-auto">
              <div className="flex flex-row w-full m-auto">
                <div className="w-full flex py-2 rounded-lg justify-between">
                  <h2 className="text-2xl">Your staked pools</h2>
                  {(bgLoading.includes(bgLoadingStates.allStakedPools) ||
                    bgLoading.includes(bgLoadingStates.singlePoolData)) &&
                  accountId ? (
                    <div id="loadingStakeMessage" className="text-xs lg:text-base text-center px-3 flex">
                      Loading most recent information{" "}
                      <div className="pt-1 flex">
                        <PulseLoader color="white" size="4px" margin="3px" />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {userMessage ? (
                <div className="flex flex-row justify-center items-center h-60 bg-trade-darkBlue bg-opacity-40 rounded-lg">
                  <UserMessageModal
                    id={messageId}
                    message={userMessage}
                    pulse={false}
                    container={false}
                    timeout={null}
                    className="bg-opacity-60"
                  />
                </div>
              ) : (
                <div>
                  <ul className={`${bgLoading ? " md:mt-1" : "md:mt-5"} pr-3 pl-3 pt-5 `}>
                    {allStakedPools?.map((pool: PoolData, index: number) => (
                      <LiquidityPositionItem pool={pool} index={index} />
                    ))}
                  </ul>
                </div>
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
              <div className="flex flex-row w-full m-auto">
                <div className="max-w-2xl w-full py-2 bg-black">
                  <div className="w-full flex justify-center">
                    <div className="w-full pr-1">
                      <button
                        id="importStakeBtn"
                        title="Import your stake information."
                        disabled={accountId ? false : true}
                        onClick={() => {
                          setShowModal(true);
                        }}
                        className={`p-3 w-full rounded ${
                          accountId
                            ? "bg-gray-700 hover:bg-opacity-60 text-background-800"
                            : "bg-trade-darkBlue bg-opacity-75 text-gray-400 cursor-not-allowed"
                        }`}
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
            </div>
        </div>
        <div className="mb-18">

        <Footer />
        </div>
      </div>
  );
};

export default LiquidityPosition;
