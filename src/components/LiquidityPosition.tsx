import { useContext, useEffect, useState } from "react";
import {
  bgLoadingStates,
  GlobalContext,
  removeBgLoadingState,
} from "../context/GlobalState";
import LiquidityPositionItem from "./LiquidityPositionItem";
import YellowXLoader from "../assets/YellowXLoader.gif";
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
    setBgLoading,
    config,
    web3,
    stakeFetchTimeout,
    setStakeFetchTimeout,
  } = useContext(GlobalContext);
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string | userMessage | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setAllStakedPools(null);
    setBgLoading([...bgLoading, bgLoadingStates.allStakedPools]);
    let localData: any;
    try {
      if (accountId) {
        localData = getLocalPoolData(accountId, chainId);
        if (localData && localData != null) {
          setNoStakedPools(false);
          setAllStakedPools(JSON.parse(localData));
          setLoading(false);
        }
      }

      if (localData) {
        localData = JSON.parse(localData);
        updateUserStakePerPool({
          ocean,
          accountId,
          localData,
          setAllStakedPools,
        }).then(() => {
          setBgLoading(
            removeBgLoadingState(bgLoading, bgLoadingStates.allStakedPools)
          );
          setLoading(false);
          setNoStakedPools(false);
          setUserMessage(null);
        });
      } else {
        console.log("There is no local data.");
        setUserMessage(
          "Dont see your tokens? Import a certain pool, or scan the entire blockchain."
        );
        setBgLoading(
          removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData)
        );
      }
    } catch (error) {
      console.error(error);
    }

    if (!accountId) {
      setUserMessage("Connect your wallet to see staked oceans.");
      setLoading(false);
    } else if (accountId && localData && !allStakedPools) {
      setUserMessage(
        "Dont see your tokens? Import a certain pool, or scan the entire blockchain."
      );
    } else if (accountId && allStakedPools) {
      setUserMessage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean]);

  useEffect(() => {
    if (noStakedPools) {
      setUserMessage(
        "You have no stake in any pools, check out StakeX to buy stake!"
      );
    }
  }, [noStakedPools]);

  useEffect(() => {
    console.log(userMessage);
  }, [userMessage]);

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
      setBgLoading(
        removeBgLoadingState(bgLoading, bgLoadingStates.singlePoolData)
      );
    });
  }

  return (
    <div className="w-full pb-5 flex justify-center ">
      <div className=" bg-primary-900 max-w-2xl p-2 rounded-lg w-full flex flex-col px-3 ">
        <div className="flex flex-row w-full justify-center">
          <div className="max-w-2xl w-full flex py-2 rounded-lg justify-between bg-primary-900">
            <h2 className="text-2xl">Your staked pools</h2>
            {(bgLoading.includes(bgLoadingStates.allStakedPools) ||
              bgLoading.includes(bgLoadingStates.singlePoolData)) &&
            accountId ? (
              <div className="text-xs lg:text-base text-center px-3 flex">
                Loading most recent information{" "}
                <div className="pt-1 flex">
                  <PulseLoader color="white" size="4px" margin="3px" />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {userMessage ? (
          <div className="flex flex-row justify-center items-center h-60 bg-primary-800 rounded-lg">
            <UserMessageModal
              message={userMessage}
              pulse={false}
              container={false}
              timeout={null}
            />
          </div>
        ) : (
          <div>
            <ul
              className={`${
                bgLoading ? " md:mt-1" : "md:mt-5"
              } pr-3 pl-3 pt-5 `}
            >
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
        <div className="flex flex-row w-full justify-center">
          <div className="max-w-2xl w-full py-2 rounded-lg bg-primary-900">
            <div className="w-full flex">
              <div className="w-1/2 pr-1">
                <button
                  title="Import your stake information."
                  disabled={accountId ? false : true}
                  onClick={() => {
                    setShowModal(true);
                  }}
                  className={`p-3 w-full  bg-primary-600 rounded ${
                    accountId
                      ? "bg-primary-600 text-white hover:bg-primary-500"
                      : "bg-primary-800 text-gray-500"
                  }`}
                >
                  Import
                </button>
              </div>
              <div className="w-1/2 pl-1">
                <button
                  title="Scan for your stake information."
                  disabled={accountId ? false : true}
                  onClick={() => {
                    scanData();
                  }}
                  className={`p-3 w-full  bg-primary-600 rounded ${
                    accountId
                      ? "bg-primary-600 text-white hover:bg-primary-500"
                      : "bg-primary-800 text-gray-500"
                  }`}
                >
                  Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPosition;
