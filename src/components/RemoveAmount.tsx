import { useContext, useEffect, useState } from "react";
import { BsArrowDown } from "react-icons/bs";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { GlobalContext, bgLoadingStates, removeBgLoadingState } from "../context/GlobalState";
import getTokenList from "../utils/tokenListUtils";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import UserMessageModal, { userMessage } from "./UserMessageModal";
import { toFixed18, toFixed2, toFixed5, limitDecimalsInInput, checkNotation } from "../utils/equate";
import { updateSingleStakePool } from "../utils/stakedPoolsUtils";
import { PulseLoader } from "react-spinners";
import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import usePTxManager from "../hooks/usePTxManager";
import useTxModalToggler from "../hooks/useTxModalToggler";
import errorMessages from "../utils/errorMessages";
import { DebounceInput } from "react-debounce-input";
import useCurrentPool from "../hooks/useCurrentPool";

const RemoveAmount = () => {
  const {
    allStakedPools,
    chainId,
    accountId,
    currentStakePool,
    setCurrentStakePool,
    setAllStakedPools,
    ocean,
    web3,
    setTokenResponse,
    bgLoading,
    setBgLoading,
    txHistory,
    setTxHistory,
    showConfirmModal,
    setShowConfirmModal,
    showTxDone,
    setShowTxDone,
    notifications,
    setNotifications,
  } = useContext(GlobalContext);
  const [noWallet, setNoWallet] = useState<boolean>(false);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnText, setBtnText] = useState("Approve and Withdrawal");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [poolAddress, setPoolAddress] = useState<string>("");
  const [pendingUnstakeTx, setPendingUnstakeTx] = useState<number | string>();
  const [userMessage, setUserMessage] = useState<userMessage | null>();
  const [txReceipt, setTxReceipt] = useState<any | null>(null);
  //very last transaction
  const [lastTxId, setLastTxId] = useState<any>(null);
  //Percent of shares from input field
  const [sharesPercToRemove, setSharesPercToRemove] = useState<string | number>("");
  //Remove amount in shares
  const [sharesToRemove, setSharesToRemove] = useState<string>("0");
  //Amount to be recieved from remove amount (this might not be neccessary)
  const [oceanToReceive, setOceanToReceive] = useState<string>("0");
  //Max possible amount of OCEAN to remove
  const [maxOceanRemove, setMaxOceanRemove] = useState<{
    OCEAN: number;
    shares: number;
  }>({ OCEAN: 0, shares: 0 });

  async function getMaxOceanUnstake() {
    setBgLoading([...bgLoading, bgLoadingStates.maxUnstake]);
    //.98 is a fix for the MAX_OUT_RATIO error from the contract
    const oceanAmt =
      0.98 * (await ocean.getMaxUnstakeAmount(currentStakePool.address, ocean.config.default.oceanTokenAddress));

    const shareAmt = await ocean.getPoolSharesRequiredToUnstake(
      currentStakePool.address,
      ocean.config.default.oceanTokenAddress,
      toFixed18(oceanAmt)
    );

    setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
    return { OCEAN: Number(oceanAmt), shares: shareAmt };
  }

  //hooks
  usePTxManager(lastTxId);
  useTxModalToggler(txReceipt);
  useCurrentPool(poolAddress, setPoolAddress, txReceipt, setTxReceipt);

  useEffect(() => {
    if (ocean && currentStakePool) {
      getMaxOceanUnstake()
        .then((res: any) => {
          setMaxOceanRemove(res);
          console.log("Max unstake amount set at:", res);
        })
        .catch(console.log);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, currentStakePool]);

  useEffect(() => {
    console.log("Currently loading in background:", bgLoading);
    setInputDisabled(false);
    if (bgLoading.includes(bgLoadingStates.singlePoolData)) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText("Loading your liquidity information.");
    } else if (currentStakePool && Number(currentStakePool.shares) === 0) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText("Not Enough Shares");
    } else if (pendingUnstakeTx) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText("Processing Transaction ...");
    } else if (Number(sharesToRemove) === 0 || Number(oceanToReceive) === 0) {
      setBtnDisabled(true);
      setBtnText("Enter Amount to Remove");
    } else {
      setBtnDisabled(false);
      setBtnText("Approve and Withdrawal");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgLoading.length, sharesToRemove, pendingUnstakeTx, currentStakePool, maxOceanRemove]);

  useEffect(() => {
    const otherToken = "OCEAN";
    getTokenList({
      chainId,
      web3,
      setTokenResponse,
      accountId,
      otherToken,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, accountId]);

  useEffect(() => {
    accountId ? setNoWallet(false) : setNoWallet(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, chainId, sharesToRemove]);

  const updateNum = async (val: any) => {
    let percInput = Number(val);
    val = limitDecimalsInInput(val);
    setSharesPercToRemove(val);
    if (percInput <= 0) {
      setSharesPercToRemove(0);
      setOceanToReceive("0");
      setSharesToRemove("0");
      return;
    }
    setBgLoading([...bgLoading, bgLoadingStates.calcTrade]);

    if (percInput >= 100) {
      val = "100";
      percInput = 100;
      setSharesPercToRemove("100");
    }

    if (percInput > 0 && percInput <= 100) setSharesPercToRemove(val);

    const userTotalStakedOcean = await ocean.getOceanRemovedforPoolShares(
      currentStakePool.address,
      currentStakePool.shares
    );

    console.log("Current user shares", currentStakePool.shares);

    let oceanFromPerc: any = userTotalStakedOcean * (percInput / 100);

    console.log("Ocean received for total shares:", userTotalStakedOcean);
    console.log("Ocean received from user input:", oceanFromPerc);

    oceanFromPerc = checkNotation(oceanFromPerc);

    const sharesNeeded = await ocean.getPoolSharesRequiredToUnstake(
      currentStakePool.address,
      ocean.config.default.oceanTokenAddress,
      toFixed18(oceanFromPerc)
    );

    console.log("User shares from percentage", sharesNeeded);
    if (maxOceanRemove.OCEAN > Number(oceanFromPerc)) {
      console.log("User share input is less than max unstake");
      setOceanToReceive(checkNotation(oceanFromPerc));
      setSharesToRemove(sharesNeeded);
    } else {
      console.log("User share input is greater than max unstake");
      setOceanToReceive(checkNotation(maxOceanRemove.OCEAN));
      setSharesToRemove(checkNotation(maxOceanRemove.shares));
      setSharesPercToRemove(toFixed2((maxOceanRemove.OCEAN / userTotalStakedOcean) * 100));
    }
    setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
  };

  async function setMaxUnstake() {
    setBgLoading([...bgLoading, bgLoadingStates.maxUnstake]);
    let maxUnstake: any = maxOceanRemove;
    if (!maxUnstake) {
      maxUnstake = await getMaxOceanUnstake();
      maxUnstake = Number(maxUnstake);
    }

    console.log("Max unstake is set at:", maxUnstake);

    //find whether user staked oceans is greater or lesser than max unstake
    const userTotalStakedOcean = await ocean.getOceanRemovedforPoolShares(
      currentStakePool.address,
      currentStakePool.shares
    );

    console.log("Total user shares in ocean", userTotalStakedOcean);

    //find the lesser token amount from above
    if (Number(userTotalStakedOcean) > Number(maxUnstake.OCEAN)) {
      console.log("User has more tokens than max unstake.");
      setSharesToRemove(maxUnstake.shares);
      setSharesPercToRemove(toFixed2((maxUnstake.OCEAN / userTotalStakedOcean) * 100));
      setOceanToReceive(checkNotation(maxUnstake.OCEAN));
      setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
      return;
    } else {
      console.log("User has less tokens than max unstake.");
      const sharesNeeded = await ocean.getPoolSharesRequiredToUnstake(
        currentStakePool.address,
        ocean.config.default.oceanTokenAddress,
        String(userTotalStakedOcean)
      );
      setSharesToRemove(sharesNeeded);
      setSharesPercToRemove("100");
      setOceanToReceive(toFixed18(userTotalStakedOcean));
      setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
    }
  }

  const handleUnstake = async () => {
    let txDateId;
    setShowConfirmModal(true);
    try {
      txDateId = addTxHistory({
        chainId,
        setTxHistory,
        txHistory,
        accountId: String(accountId),
        token1: currentStakePool.token1,
        token2: currentStakePool.token2,
        txType: "unstake",
        status: "pending",
        stakeAmt: sharesToRemove,
      });
      setLastTxId(txDateId);
      setPendingUnstakeTx(txDateId);
      console.log(
        `Unstaking from pool ${currentStakePool.address}, ${toFixed18(currentStakePool.shares)} shares for ${toFixed18(
          oceanToReceive
        )} OCEAN`
      );
      const txReceipt = await ocean.unstakeOcean(
        accountId,
        currentStakePool.address,
        toFixed18(oceanToReceive),
        toFixed18(currentStakePool.shares)
      );

      if (txReceipt) {
        setRecentTxHash(ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash);
        setTxReceipt(txReceipt);
        setPendingUnstakeTx(undefined);
        addTxHistory({
          chainId,
          setTxHistory,
          txHistory,
          accountId: String(accountId),
          token1: currentStakePool.token1,
          token2: currentStakePool.token2,
          txType: "unstake",
          txDateId,
          status: "indexing",
          txHash: txReceipt.transactionHash,
          stakeAmt: sharesToRemove,
          txReceipt,
        });

        console.log("Current Pool Address:", poolAddress);

        setSharesPercToRemove(0);
        setOceanToReceive("0");
      } else {
        throw new Error("Didn't receive a receipt.");
      }
    } catch (error: any) {
      console.error(error);
      setPendingUnstakeTx(undefined);
      const allNotifications = notifications;
      allNotifications.push({
        type: "alert",
        alert: {
          message: errorMessages(error),
          link: null,
          type: "alert",
        },
      });
      setNotifications([...allNotifications]);
      setShowConfirmModal(false);
      setShowTxDone(false);
      deleteRecentTxs({
        txDateId,
        setTxHistory,
        txHistory,
        chainId,
        accountId,
      });
    }
  };

  return noWallet ? (
    <UserMessageModal message="Connect your wallet to continue." pulse={false} container={true} timeout={null} />
  ) : noStakedPools ? (
    <UserMessageModal
      message="You have no stake in any pools, check out StakeX to buy stake!"
      pulse={false}
      container={true}
      timeout={null}
    />
  ) : currentStakePool ? (
    <>
      <div id="removeStakeModal" className="flex w-full items-center mb-20">
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
                    {currentStakePool?.token1.symbol}/{currentStakePool?.token2.symbol}
                  </p>
                ) : (
                  <PulseLoader color="white" size="4px" margin="5px" />
                )}
              </div>
              {bgLoading.includes(bgLoadingStates.singlePoolData) ? (
                <UserMessageModal
                  message="Loading your liquidity position."
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
                  <span className={`text-2xl ${sharesToRemove ? "text-primary-400" : null}`}>
                    <DebounceInput
                      id="unstakeAmtInput"
                      step="1"
                      debounceTimeout={500}
                      onChange={(e) => updateNum(e.target.value)}
                      onWheel={(event: any) => event.currentTarget.blur()}
                      onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                      type="number"
                      className="h-full w-24 rounded-lg bg-primary-900 text-2xl px-1 outline-none focus:placeholder-type-200 placeholder-type-400 text-right"
                      placeholder="0.00"
                      value={sharesPercToRemove}
                      disabled={inputDisabled}
                    />
                    %
                  </span>
                </div>
                <div>
                  <p id="sharesDisplay" className="text-sm text-type-400 whitespace-nowrap text-right">
                    {Number(currentStakePool.shares) === 0
                      ? "Shares: 0"
                      : Number(currentStakePool.shares) > 0.001
                      ? `Shares: ${toFixed5(currentStakePool.shares)}`
                      : "Shares: < 0.001"}
                  </p>
                  {bgLoading.includes(bgLoadingStates.singlePoolData) ||
                  bgLoading.includes(bgLoadingStates.maxUnstake) ? (
                    <div className="text-center">
                      <PulseLoader color="white" size="4px" margin="5px" />
                    </div>
                  ) : (
                    <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                      <Button
                        id="maxUnstakeBtn"
                        onClick={() => {
                          setMaxUnstake();
                        }}
                        disabled={Number(currentStakePool.shares) === 0}
                        text="Max Unstake"
                        classes={`px-2 lg:w-24 py-0 border border-type-300 rounded-full text-xs ${
                          inputDisabled || Number(currentStakePool.shares) === 0 ? "text-gray-700" : null
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-4 relative my-12">
              <div className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center swap-center">
                <BsArrowDown size="30" className="text-gray-300" />
              </div>
            </div>
            <div className="bg-primary-800 p-4 rounded ">
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
                      <p
                        id="oceanToReceive"
                        title={oceanToReceive}
                        className="text-type-100 w-20 overflow-hidden overflow-ellipsis whitespace-nowrap"
                      >
                        {bgLoading.includes(bgLoadingStates.calcTrade) ? (
                          <PulseLoader color="white" size="4px" margin="3px" />
                        ) : (
                          oceanToReceive || 0
                        )}
                      </p>
                      <p className="text-xs text-type-100">{currentStakePool?.token2.symbol}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex mt-4">
              {/* <div className="bg-gradient"></div> */}
              <Button
                id="executeUnstake"
                text={btnText}
                onClick={() => {
                  setShowConfirmModal(true);
                  handleUnstake();
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
            <Link id="remove-lp-link" to="/stakeX/list" className="text-gray-300 hover:text-gray-100 transition-colors">
              {"<"} Back to liquidity position
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={showConfirmModal}
        close={() => setShowConfirmModal(false)}
        txs={
          currentStakePool && sharesToRemove && oceanToReceive
            ? [
                `Approve DataX to spend ${toFixed5(sharesToRemove)} shares.`,
                `Unstake ${toFixed5(oceanToReceive)} OCEAN from the ${currentStakePool.token1.symbol || "OCEAN"} pool.`,
              ]
            : []
        }
      />
      <TransactionDoneModal show={showTxDone} txHash={recentTxHash} close={() => setShowTxDone(false)} />

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
