import { useContext, useEffect, useState } from "react";
import { BsArrowDown } from "react-icons/bs";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { GlobalContext, bgLoadingStates, removeBgLoadingState } from "../context/GlobalState";
import getTokenList, { getAllowance } from "../utils/tokenUtils";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import UserMessageModal, { userMessage } from "./UserMessageModal";
import { toFixed18, toFixed5 } from "../utils/equate";
import { MoonLoader, PulseLoader } from "react-spinners";
import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import usePTxManager from "../hooks/usePTxManager";
import useTxModalToggler from "../hooks/useTxModalToggler";
import errorMessages from "../utils/errorMessages";
import { DebounceInput } from "react-debounce-input";
import useCurrentPool from "../hooks/useCurrentPool";
import BigNumber from "bignumber.js";
import WrappedInput from "./WrappedInput";
import UnlockTokenModal from "./UnlockTokenModal";

const RemoveAmount = () => {
  const {
    chainId,
    accountId,
    currentStakePool,
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
    setShowUnlockTokenModal,
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
  const [sharesPercToRemove, setSharesPercToRemove] = useState<BigNumber>(new BigNumber(0));
  //Remove amount in shares
  const [sharesToRemove, setSharesToRemove] = useState<BigNumber>(new BigNumber(0));
  //Amount to be recieved from remove amount (this might not be neccessary)
  const [oceanToReceive, setOceanToReceive] = useState<BigNumber>(new BigNumber(0));
  const [allowance, setAllowance] = useState<BigNumber>(new BigNumber(0));
  interface IMaxUnstake {
    OCEAN: BigNumber;
    shares: BigNumber;
    userPerc: BigNumber;
  }

  //Max possible amount of OCEAN to remove
  const [maxUnstake, setMaxUnstake] = useState<IMaxUnstake | null>({
    OCEAN: new BigNumber(0),
    shares: new BigNumber(0),
    userPerc: new BigNumber(0),
  });

  async function getMaxUnstake(): Promise<IMaxUnstake | void> {
    setBgLoading([...bgLoading, bgLoadingStates.maxUnstake]);

    try {
      //.98 is a fix for the MAX_OUT_RATIO error from the contract
      const oceanAmt: BigNumber = new BigNumber(
        await ocean.getMaxUnstakeAmount(currentStakePool.address, ocean.config.default.oceanTokenAddress)
      ).multipliedBy(0.98);

      const shareAmt: BigNumber = new BigNumber(
        await ocean.getPoolSharesRequiredToUnstake(
          currentStakePool.address,
          ocean.config.default.oceanTokenAddress,
          oceanAmt.toFixed(18)
        )
      );

      const userPerc: BigNumber = shareAmt.div(Number(currentStakePool.shares)).multipliedBy(100);
      return { OCEAN: oceanAmt, shares: shareAmt, userPerc };
    } catch (error) {
      console.error(error);
    }
  }

  //hooks
  usePTxManager(lastTxId);
  useTxModalToggler(txReceipt, setTxReceipt);
  useCurrentPool(poolAddress, setPoolAddress, txReceipt, setTxReceipt);

  useEffect(() => {
    if (ocean && currentStakePool) {
      getMaxUnstake()
        .then((res: IMaxUnstake | void) => {
          if (res) {
            setMaxUnstake(res);
            console.log("Max unstake amount set at:", { ocean: res.OCEAN.toString(), shares: res.shares.toString() });
          }
        })
        .catch(console.error)
        .finally(() => {
          setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
        });

      getAllowance(currentStakePool.token1.tokenAddress, accountId, currentStakePool.address, ocean).then((res) => {
        setAllowance(new BigNumber(res));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, currentStakePool]);

  useEffect(() => {
    console.log("Currently loading in background:", bgLoading);
    console.log(currentStakePool);

    setInputDisabled(false);
    if (currentStakePool && Number(currentStakePool.shares) === 0) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText("Not Enough Shares");
    } else if (pendingUnstakeTx) {
      setBtnDisabled(true);
      setInputDisabled(true);
      setBtnText("Processing Transaction ...");
    } else if (sharesToRemove.eq(0) || oceanToReceive.eq(0)) {
      setBtnDisabled(true);
      setBtnText("Enter Amount to Remove");
    } else if (oceanToReceive.lt(0.01)) {
      setBtnDisabled(true);
      setBtnText("Minimum Removal is .01 OCEAN");
    } else if(allowance.lt(oceanToReceive)){
      setBtnDisabled(false)
      setBtnText(`Unlock ${currentStakePool.token1.symbol}`)
    }else {
      setBtnDisabled(false);
      setBtnText("Approve and Withdrawal");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgLoading.length, sharesToRemove, pendingUnstakeTx, currentStakePool, maxUnstake]);

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

  useEffect(() => {
    console.log(sharesPercToRemove);
  }, [sharesPercToRemove]);

  const updateNum = async (val: string) => {
    let max: IMaxUnstake | void;
    maxUnstake?.OCEAN.gt(0) ? (max = maxUnstake) : (max = await getMaxUnstake());
    try {
      if (max && max.OCEAN.gt(0) && max.shares.gt(0)) {
        let percInput: BigNumber = new BigNumber(val);
        setSharesPercToRemove(percInput);
        if (percInput.lte(0)) {
          setSharesPercToRemove(new BigNumber(0));
          setOceanToReceive(new BigNumber(0));
          setSharesToRemove(new BigNumber(0));
          return;
        }
        setBgLoading([...bgLoading, bgLoadingStates.calcTrade]);

        if (percInput.gte(100)) {
          val = "100";
          percInput = new BigNumber(100);
          setSharesPercToRemove(new BigNumber(100));
        }

        if (percInput.gt(0) && percInput.lte(100)) setSharesPercToRemove(percInput);

        const userTotalStakedOcean: BigNumber = new BigNumber(
          await ocean.getOceanRemovedforPoolShares(currentStakePool.address, currentStakePool.shares)
        );

        console.log("Current user shares", currentStakePool.shares);

        const oceanFromPerc: BigNumber = userTotalStakedOcean.times(percInput).div(100);

        console.log("Ocean received for total shares:", userTotalStakedOcean);
        console.log("Ocean received from user input:", oceanFromPerc);

        const sharesNeeded = new BigNumber(
          await ocean.getPoolSharesRequiredToUnstake(
            currentStakePool.address,
            ocean.config.default.oceanTokenAddress,
            oceanFromPerc.toFixed(18)
          )
        );

        console.log("User shares from percentage", sharesNeeded);
        if (maxUnstake?.OCEAN?.gt(oceanFromPerc)) {
          console.log("User share input is less than max unstake");
          setOceanToReceive(oceanFromPerc);
          setSharesToRemove(sharesNeeded);
          setSharesPercToRemove(new BigNumber(val));
        } else {
          console.log("User share input is greater than max unstake");
          setOceanToReceive(max.OCEAN);
          setSharesToRemove(max.shares);
          setSharesPercToRemove(max.OCEAN.div(userTotalStakedOcean).times(100));
        }
        setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function maxUnstakeHandler() {
    setBgLoading([...bgLoading, bgLoadingStates.maxUnstake]);
    let max: IMaxUnstake | void;
    maxUnstake ? (max = maxUnstake) : (max = await getMaxUnstake());
    console.log("Max unstake is set at:", max);

    try {
      if (max && max.OCEAN.gt(0) && max.shares.gt(0)) {
        const userTotalStakedOcean: BigNumber = new BigNumber(
          await ocean.getOceanRemovedforPoolShares(currentStakePool.address, currentStakePool.shares)
        );

        console.log("Total user shares in ocean", userTotalStakedOcean);
        //find whether user staked oceans is greater or lesser than max unstake
        if (userTotalStakedOcean.gt(max?.OCEAN)) {
          setSharesToRemove(max.shares);
          setSharesPercToRemove(max.OCEAN.div(userTotalStakedOcean).times(100));
          setOceanToReceive(max.OCEAN);
          setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
          return;
        } else {
          const sharesNeeded = new BigNumber(
            await ocean.getPoolSharesRequiredToUnstake(
              currentStakePool.address,
              ocean.config.default.oceanTokenAddress,
              userTotalStakedOcean.toFixed(18)
            )
          );
          setSharesToRemove(sharesNeeded);
          setSharesPercToRemove(new BigNumber(100));
          setOceanToReceive(userTotalStakedOcean);
          setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
        }
      }
    } catch (error) {
      console.error(error);
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
        stakeAmt: sharesToRemove?.toFixed(5),
      });
      setLastTxId(txDateId);
      setPendingUnstakeTx(txDateId);
      console.log(
        `Unstaking from pool ${currentStakePool.address}, ${toFixed18(
          currentStakePool.shares
        )} shares for ${oceanToReceive?.toFixed(5)} OCEAN`
      );
      //shares needs to be to fixed 18, need types in global context
      const txReceipt = await ocean.unstakeOcean(
        accountId,
        currentStakePool.address,
        oceanToReceive.toFixed(18),
        currentStakePool.shares
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
          stakeAmt: sharesToRemove?.toFixed(5),
          txReceipt,
        });

        console.log("Current Pool Address:", poolAddress);
        setSharesPercToRemove(new BigNumber(0));
        setOceanToReceive(new BigNumber(0));
        setSharesToRemove(new BigNumber(0));
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
      setSharesPercToRemove(new BigNumber(0));
      setOceanToReceive(new BigNumber(0));
      setSharesToRemove(new BigNumber(0));
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
                  id="loading-lp"
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
                      value={!sharesPercToRemove ? "" : sharesPercToRemove?.dp(2).toString()}
                      disabled={inputDisabled}
                      element={WrappedInput}
                      max={maxUnstake?.userPerc.dp(5).toString()}
                      data-test-max-perc={maxUnstake?.userPerc.dp(5).toString()}
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
                  <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                    <Button
                      id="maxUnstakeBtn"
                      onClick={() => {
                        maxUnstakeHandler();
                      }}
                      disabled={Number(currentStakePool.shares) === 0}
                      text="Max Unstake"
                      classes={`px-2 lg:w-24 py-0 border border-type-300 rounded-full text-xs ${
                        inputDisabled || Number(currentStakePool.shares) === 0 ? "text-gray-700" : null
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 relative my-12">
              <div className="rounded-full border-primary-900 border-4 absolute -top-14 bg-primary-800 w-16 h-16 flex items-center justify-center swap-center">
                {bgLoading.includes(bgLoadingStates.singlePoolData) ||
                bgLoading.includes(bgLoadingStates.maxUnstake) ||
                bgLoading.includes(bgLoadingStates.calcTrade) ? (
                  <MoonLoader size={25} color={"white"} />
                ) : (
                  <BsArrowDown size="30" className="text-gray-300" />
                )}
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
                        data-test-max-ocean={maxUnstake?.OCEAN.dp(5).toString()}
                        id="oceanToReceive"
                        title={oceanToReceive.toString()}
                        className="text-type-100 w-20 overflow-hidden overflow-ellipsis whitespace-nowrap"
                      >
                        {oceanToReceive.lt(new BigNumber(0.00001)) ? 0 : oceanToReceive.toString() || 0}
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
                  if (allowance.lt(oceanToReceive)) {
                    setShowUnlockTokenModal(true);
                  } else {
                    setShowConfirmModal(true);
                    handleUnstake();
                  }
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

      <UnlockTokenModal
        token1={{
          value: sharesToRemove,
          percentage: sharesPercToRemove,
          loading: false,
          info: {...currentStakePool.token1, pool: currentStakePool.address},
          balance: currentStakePool.shares,
        }}
        token2={{
          value: new BigNumber(0),
          percentage: new BigNumber(0),
          loading: false,
          info: currentStakePool.token1,
          balance: new BigNumber(0),
        }}
        setToken={setAllowance}
        nextFunction={() => {
          setShowConfirmModal(true);
          handleUnstake();
        }}
        remove={true}
      />

      <ConfirmModal
        show={showConfirmModal}
        close={() => setShowConfirmModal(false)}
        txs={
          currentStakePool && sharesToRemove && oceanToReceive
            ? [
                `Unstake ${oceanToReceive.dp(5).toString()} OCEAN from the ${
                  currentStakePool.token1.symbol || "OCEAN"
                } pool.`,
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
