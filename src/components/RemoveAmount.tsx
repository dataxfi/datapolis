import { useContext, useEffect, useState } from "react";
import { BsArrowDown } from "react-icons/bs";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import {
  GlobalContext,
  bgLoadingStates,
  removeBgLoadingState,
} from "../context/GlobalState";
import getTokenList from "../utils/useTokenList";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import UserMessageModal, { userMessage } from "./UserMessageModal";
import {
  toFixed18,
  toFixed2,
  toFixed5,
  limitDecimalsInInput,
} from "../utils/equate";
import setPoolDataFromOcean, {
  getLocalPoolData,
  setPoolDataFromLocal,
} from "../utils/useAllStakedPools";
import { PulseLoader } from "react-spinners";
import { addTxHistory, deleteRecentTxs } from "../utils/useTxHistory";

const RemoveAmount = () => {
  const {
    allStakedPools,
    chainId,
    accountId,
    currentStakePool,
    setCurrentStakePool,
    setAllStakedPools,
    setLoading,
    ocean,
    web3,
    setTokenResponse,
    bgLoading,
    setBgLoading,
    txHistory,
    setTxHistory,
    pendingTxs,
    setPendingTxs,
    setShowSnackbar,
    setLastTxId,
    loading,
    config,
    showConfirmModal,
    setShowConfirmModal,
    showTxDone,
    setShowTxDone,
  } = useContext(GlobalContext);
  const [noWallet, setNoWallet] = useState<boolean>(false);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnText, setBtnText] = useState("Approve and Withdrawal");
  const [poolAddress, setPoolAddress] = useState<string>();
  const [pendingUnstakeTx, setPendingUnstakeTx] = useState<number | string>();
  const [userMessage, setUserMessage] = useState<userMessage | null>();
  const [txReceipt, setTxReceipt] = useState<any | null>(null);

  //Percent of shares from input field
  const [sharesPercToRemove, setSharesPercToRemove] = useState<string | number>(
    ""
  );
  //Remove amount in shares
  const [sharesToRemove, setSharesToRemove] = useState<number>(0);
  //Amount to be recieved from remove amount (this might not be neccessary)
  const [oceanToReceive, setOceanToReceive] = useState<number>(0);
  //Max possible amount of OCEAN to remove
  const [maxOceanRemove, setMaxOceanRemove] = useState<{
    OCEAN: number;
    shares: number;
  }>({ OCEAN: 0, shares: 0 });

  const location = useLocation();

  async function getMaxOceanUnstake() {
    const oceanAmt = await ocean.getMaxUnstakeAmount(
      currentStakePool.address,
      ocean.config.default.oceanTokenAddress
    );

    const shareAmt = await ocean.getPoolSharesRequiredToUnstake(
      currentStakePool.address,
      ocean.config.default.oceanTokenAddress,
      oceanAmt
    );
    return { OCEAN: Number(oceanAmt), shares: shareAmt };
  }

  useEffect(() => {
    if (ocean && currentStakePool) {
      getMaxOceanUnstake()
        .then((res: any) => {
          setMaxOceanRemove(res);
          console.log("Max unstake amount set at:", res);
        })
        .catch(console.log);
    }
  }, [ocean, currentStakePool]);

  // custom hook??
  useEffect(() => {
    if (txReceipt) {
      console.log("A succesful txReceipt has been set in Unstake\n", txReceipt);
      if (showConfirmModal) {
        setShowConfirmModal(false);
        setShowTxDone(true);
      }
    }
  }, [txReceipt]);

  useEffect(() => {
    console.log(bgLoading);
    if (bgLoading.includes("stake")) {
      setBtnDisabled(true);
      setBtnText("Loading your liquidity information.");
    } else if (pendingUnstakeTx) {
      setBtnDisabled(true);
      setBtnText("Awaiting transaction for current pool.");
    } else if (Number(sharesToRemove) == 0) {
      setBtnDisabled(true);
      setBtnText("Approve and Withdrawal");
    } else {
      setBtnDisabled(false);
      setBtnText("Approve and Withdrawal");
    }
  }, [bgLoading.length, sharesToRemove, pendingUnstakeTx]);

  useEffect(() => {
    const otherToken = "OCEAN";
    getTokenList({
      chainId,
      web3,
      setTokenResponse,
      accountId,
      otherToken,
    });

    setBgLoading([...bgLoading, "pool"]);
    const queryParams = new URLSearchParams(location.search);
    const poolAddressParam = queryParams.get("pool");

    if (poolAddressParam) setPoolAddress(poolAddressParam);

    let foundInLocal;

    if (accountId) {
      const localStoragePoolData = getLocalPoolData(accountId, chainId);
      if (localStoragePoolData && poolAddressParam) {
        foundInLocal = setPoolDataFromLocal({
          localStoragePoolData,
          poolAddress: poolAddressParam,
          setAllStakedPools,
          setCurrentStakePool,
          setBgLoading,
          bgLoading,
        });
      }
    }

    if (
      !currentStakePool &&
      !allStakedPools &&
      ocean &&
      accountId &&
      !foundInLocal
    ) {
      setPoolDataFromOcean({
        accountId,
        chainId,
        ocean,
        poolAddress: poolAddressParam,
        setAllStakedPools,
        setCurrentStakePool,
        setNoStakedPools,
        bgLoading,
        setLoading,
        config,
        web3,
        allStakedPools,
      });

      if (allStakedPools) {
        setCurrentStakePool(
          allStakedPools.find(
            (pool: { address: string }) => pool.address === poolAddressParam
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, accountId]);

  useEffect(() => {
    accountId ? setNoWallet(false) : setNoWallet(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, chainId, sharesToRemove]);

  const updateNum = async (val: any) => {
    const percInput = Number(val);
    val = limitDecimalsInInput(val);
    setSharesPercToRemove(val);

    if (percInput >= 100) setSharesPercToRemove("100");
    if (percInput <= 0) setSharesPercToRemove("");
    if (percInput > 0 && percInput <= 100) setSharesPercToRemove(val);

    const userTotalStakedOcean = await ocean.getOceanRemovedforPoolShares(
      currentStakePool.address,
      currentStakePool.shares
    );

    console.log("Current user shares", currentStakePool.shares);

    const oceanFromPerc = userTotalStakedOcean * (percInput / 100);

    const sharesNeeded = await ocean.getPoolSharesRequiredToUnstake(
      currentStakePool.address,
      ocean.config.default.oceanTokenAddress,
      String(oceanFromPerc)
    );

    console.log("User shares from percentage", sharesNeeded);
    if (maxOceanRemove.OCEAN > oceanFromPerc) {
      console.log("User share input are less than max unstake");
      setOceanToReceive(oceanFromPerc);
      setSharesToRemove(sharesNeeded);
    } else {
      console.log("User share input are greater than max unstake");
      setOceanToReceive(maxOceanRemove.OCEAN);
      setSharesToRemove(maxOceanRemove.shares);
      setSharesPercToRemove(
        toFixed2((maxOceanRemove.OCEAN / userTotalStakedOcean) * 100)
      );
    }
  };

  async function setMaxUnstake() {
    if (!maxOceanRemove) return;
    setBgLoading([...bgLoading, bgLoadingStates.maxUnstake]);

    console.log(maxOceanRemove.OCEAN);

    //find whether user staked oceans is greater or lesser than max unstake
    const userTotalStakedOcean = await ocean.getOceanRemovedforPoolShares(
      currentStakePool.address,
      currentStakePool.shares
    );

    console.log("Total user shares in ocean", userTotalStakedOcean);

    //find the lesser token amount from above
    if (Number(userTotalStakedOcean) > Number(maxOceanRemove.OCEAN)) {
      console.log("User has more tokens than max unstake.");
      setOceanToReceive(Number(toFixed18(maxOceanRemove.OCEAN)));
      setSharesToRemove(maxOceanRemove.shares);
      setSharesPercToRemove(
        toFixed2((maxOceanRemove.OCEAN / userTotalStakedOcean) * 100)
      );
      setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
      return;
    } else {
      console.log("User has less tokens than max unstake.");
      setOceanToReceive(Number(toFixed18(userTotalStakedOcean)));
      const sharesNeeded = await ocean.getPoolSharesRequiredToUnstake(
        currentStakePool.address,
        ocean.config.default.oceanTokenAddress,
        String(userTotalStakedOcean)
      );
      setSharesToRemove(sharesNeeded);
      setSharesPercToRemove("100");
      setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
    }
  }

  const handleWithdrawal = async () => {
    let txDateId;
    setShowConfirmModal(true);
    try {
      console.log(`unstaking ${oceanToReceive} ocean`);

      txDateId = addTxHistory({
        chainId,
        setTxHistory,
        txHistory,
        accountId: String(accountId),
        token1: currentStakePool.token1,
        token2: currentStakePool.token2,
        txType: "Unstake Ocean",
        status: "pending approval",
        pendingTxs,
        setPendingTxs,
        setShowSnackbar,
        setLastTxId,
        stakeAmt: sharesToRemove,
      });
      setPendingUnstakeTx(txDateId);
      console.log(
        "Unstaking with params",
        currentStakePool.address,
        oceanToReceive,
        currentStakePool.shares
      );
      const txReceipt = await ocean.unstakeOcean(
        accountId,
        currentStakePool.address,
        toFixed18(String(oceanToReceive)),
        currentStakePool.shares
      );

      if (txReceipt) {
        setRecentTxHash(
          ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash
        );

        setPendingUnstakeTx(undefined);
        addTxHistory({
          chainId,
          setTxHistory,
          txHistory,
          accountId: String(accountId),
          token1: currentStakePool.token1,
          token2: currentStakePool.token2,
          txType: "Unstake Ocean",
          txDateId,
          status: "indexing",
          txHash: txReceipt.transactionHash,
          pendingTxs,
          setPendingTxs,
          setShowSnackbar,
          setLastTxId,
          stakeAmt: sharesToRemove,
          txReceipt,
        });

        setBgLoading([...bgLoading, bgLoadingStates.allStakedPools]);
        console.log("current pool Address", poolAddress);
        setPoolDataFromOcean({
          accountId,
          ocean,
          chainId,
          setBgLoading,
          bgLoading,
          poolAddress,
          setNoStakedPools,
          setAllStakedPools,
          setCurrentStakePool,
          config,
          web3,
          allStakedPools,
        });

        setSharesPercToRemove(0);
        setOceanToReceive(0);
      } else {
        setPendingUnstakeTx(undefined);
        setUserMessage({
          message: "User rejected transaction.",
          link: null,
          type: "alert",
        });
        setShowConfirmModal(false);
        setShowTxDone(false);
        deleteRecentTxs({
          txDateId,
          setTxHistory,
          txHistory,
          chainId,
          accountId,
          pendingTxs,
          setPendingTxs,
        });
      }
    } catch (error: any) {
      console.error(error);
      setPendingUnstakeTx(undefined);
      setUserMessage({
        message: error.message,
        link: null,
        type: "alert",
      });
      setShowConfirmModal(false);
      setShowTxDone(false);
      deleteRecentTxs({
        txDateId,
        setTxHistory,
        txHistory,
        chainId,
        accountId,
        pendingTxs,
        setPendingTxs,
      });
    }
  };

  return noWallet ? (
    <UserMessageModal
      message="Connect your wallet to continue."
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
  ) : currentStakePool ? (
    <>
      <div className="flex w-full items-center mb-20">
        <div className="max-w-2xl mx-auto w-full p-4">
          <div className="max-w-2xl mx-auto bg-primary-900 w-full rounded-lg p-4 hm-box">
            <div className="flex flex-row pb-2 justify-between">
              <div className="flex flex-row">
                <img
                  src="https://gateway.pinata.cloud/ipfs/QmPQ13zfryc9ERuJVj7pvjCfnqJ45Km4LE5oPcFvS1SMDg/datatoken.png"
                  className="rounded-lg mr-2"
                  alt=""
                  width="40px"
                />
                <img
                  src="https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY"
                  className="rounded-lg mr-2"
                  alt=""
                  width="40px"
                />

                {currentStakePool ? (
                  <p className="text-type-100 text-sm md:text-lg">
                    {currentStakePool?.token1.symbol}/
                    {currentStakePool?.token2.symbol}
                  </p>
                ) : (
                  <PulseLoader color="white" size="4px" margin="5px" />
                )}
              </div>
              {bgLoading.includes("stake") ? (
                <UserMessageModal
                  message="Loading your liquidity position."
                  pulse={true}
                  container={false}
                  timeout={null}
                />
              ) : bgLoading.includes("pool") ? (
                <UserMessageModal
                  message="Loading your token."
                  pulse={true}
                  container={false}
                  timeout={null}
                />
              ) : null}
            </div>
            <div className="md:grid md:grid-cols-5 bg-primary-800 p-4 rounded">
              <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                <p className="text-type-100">Amount to unstake</p>
              </div>
              <div className="col-span-3 flex justify-between mt-3 md:mt-0 bg-primary-900 rounded-lg p-2">
                <div className="flex w-full items-center">
                  {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                  <span
                    className={`text-2xl ${
                      sharesToRemove ? "text-primary-400" : null
                    }`}
                  >
                    <input
                      step="1"
                      onChange={(e) => updateNum(e.target.value)}
                      onWheel={(event) => event.currentTarget.blur()}
                      onKeyDown={(evt) =>
                        ["e", "E", "+", "-"].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      type="number"
                      className="h-full w-24 rounded-lg bg-primary-900 text-2xl pl-2 pr-1 outline-none focus:placeholder-type-200 placeholder-type-400 text-right"
                      placeholder="0.00"
                      value={sharesPercToRemove}
                    />
                    %
                  </span>
                </div>
                <div>
                  {currentStakePool.shares ? (
                    <p className="text-sm text-type-400 whitespace-nowrap text-right">
                      Shares:{" "}
                      {Number(currentStakePool.shares).toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 4,
                        }
                      )}
                    </p>
                  ) : null}
                  {bgLoading.includes(bgLoadingStates.singlePool) ||
                  bgLoading.includes(bgLoadingStates.maxUnstake) ? (
                    <div className="text-center">
                      <PulseLoader color="white" size="4px" margin="5px" />
                    </div>
                  ) : currentStakePool.shares ? (
                    <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                      <Button
                        onClick={() => {
                          setMaxUnstake();
                        }}
                        text="Max Unstake"
                        classes="px-2 py-0 border border-type-300 rounded-full text-xs"
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
            <div className="px-4 relative my-12">
              <div className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center swap-center">
                <BsArrowDown size="30" className="text-gray-300" />
              </div>
            </div>
            <div className="bg-primary-800 p-4 rounded">
              <div className="md:grid md:grid-cols-5 bg-primary-800 p-4">
                <div className="col-span-2">
                  <p className="text-type-100">You will receive</p>
                </div>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <div className="bg-primary-900 grid grid-flow-col gap-2 p-2 rounded-lg">
                    <div>
                      <img
                        src="https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY"
                        className="w-12 rounded-lg"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="text-type-100">
                        {toFixed5(oceanToReceive) || 0}
                      </p>
                      <p className="text-xs text-type-100">
                        {currentStakePool?.token2.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex mt-4">
              {/* <div className="bg-gradient"></div> */}
              <Button
                text={btnText}
                onClick={() => {
                  setShowConfirmModal(true);
                  handleWithdrawal();
                }}
                classes={`px-4 py-4 rounded-lg w-full ${
                  btnDisabled
                    ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                    : "bg-primary-100 bg-opacity-20 hover:bg-opacity-40 text-background-800"
                }`}
                disabled={btnDisabled}
              />
            </div>
          </div>
          <div className="pt-3 pl-3">
            <Link
              to="/stakeX/list"
              className="text-gray-300 hover:text-gray-100 transition-colors"
            >
              {"<"} Back to liquidity position
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showConfirmModal}
        close={() => setShowConfirmModal(false)}
        txs={
          currentStakePool
            ? [
                `Approve DataX to spend ${toFixed5(sharesToRemove)} shares`,
                `Approve DataX to unstake ${toFixed5(
                  oceanToReceive
                )} OCEAN from the ${
                  currentStakePool.token1.symbol || "OCEAN"
                } pool.`,
              ]
            : []
        }
      />
      <TransactionDoneModal
        show={showTxDone}
        txHash={recentTxHash}
        close={() => setShowTxDone(false)}
      />

      {userMessage ? (
        <UserMessageModal
          message={userMessage}
          pulse={false}
          container={false}
          timeout={{ showState: setUserMessage, time: 5000 }}
        />
      ) : null}
    </>
  ) : null;
};

export default RemoveAmount;
