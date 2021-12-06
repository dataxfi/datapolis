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
import UserMessageModal from "./UserMessageModal";
import { toFixed18, toFixed5 } from "../utils/equate";
import setPoolDataFromOcean, {
  getLocalPoolData,
  setPoolDataFromLocal,
} from "../utils/useAllStakedPools";
import { PulseLoader } from "react-spinners";
import { addTxHistory, deleteRecentTxs } from "../utils/useTxHistory";

interface RecieveAmounts {
  dtAmount: string | number;
  oceanAmount: string | number;
}

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
  } = useContext(GlobalContext);
  const [noWallet, setNoWallet] = useState<boolean>(false);
  const [removePercent, setRemovePercent] = useState<string>("");
  const [recieveAmounts, setRecieveAmounts] = useState<RecieveAmounts>({
    dtAmount: "0",
    oceanAmount: "0",
  });
  const [removeAmount, setRemoveAmount] = useState<string>("0");
  const [showConfirmLoader, setShowConfirmLoader] = useState(false);
  const [showTxDone, setShowTxDone] = useState(false);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [noStakedPools, setNoStakedPools] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnText, setBtnText] = useState("Approve and Withdrawal");
  const location = useLocation();

  useEffect(() => {
    console.log(bgLoading);
    /*if (bgLoading.includes("stake")) {
      setBtnDisabled(true);
      setBtnText("Loading your liquidity information.");
    } else*/ if (Number(removeAmount) == 0) {
      setBtnDisabled(true)
      setBtnText("Approve and Withdrawal")
    } else {
      setBtnDisabled(false);
      setBtnText("Approve and Withdrawal");
    }
  }, [bgLoading.length, removeAmount]);

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
    const poolAddress = queryParams.get("pool");
    let foundInLocal;

    if (accountId) {
      const localStoragePoolData = getLocalPoolData(accountId, chainId);
      if (localStoragePoolData && poolAddress) {
        foundInLocal = setPoolDataFromLocal({
          localStoragePoolData,
          poolAddress,
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
        poolAddress,
        setAllStakedPools,
        setCurrentStakePool,
        setNoStakedPools,
        bgLoading,
        setLoading,
      });

      if (allStakedPools) {
        setCurrentStakePool(
          allStakedPools.find(
            (pool: { address: string }) => pool.address === poolAddress
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, accountId]);

  useEffect(() => {
    accountId ? setNoWallet(false) : setNoWallet(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, chainId, removeAmount]);

  const updateNum = (val: string) => {
    const numberAmt = Number(val);
    if (numberAmt <= 100) {
      let b = val;
      let c = val;
      c =
        b.indexOf(".") >= 0
          ? b.substr(0, b.indexOf(".")) + b.substr(b.indexOf("."), 3)
          : b;
      setRemovePercent(String(c));
      if (numberAmt >= 100) setRemovePercent("100");
      if (numberAmt <= 0) setRemovePercent("");
      if (numberAmt > 0 && numberAmt <= 100) {
        const sharesToRemove = currentStakePool.shares * (numberAmt / 100);
        setRemoveAmount(String(sharesToRemove));
        ocean
          .getTokensRemovedforPoolShares(
            currentStakePool.address,
            sharesToRemove
          )
          .then((res: RecieveAmounts) => {
            let { dtAmount, oceanAmount } = res;
            setRecieveAmounts({ dtAmount, oceanAmount });
          })
          .catch(console.error);
      } else {
        setRecieveAmounts({ dtAmount: "0", oceanAmount: "0" });
      }
    }
  };

  const handleWithdrawal = async () => {
    let txDateId 
    try {
      setShowConfirmLoader(true);
      console.log(`unstaking ${recieveAmounts.oceanAmount} ocean`);

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
        stakeAmt: removeAmount,
      });

      const txReceipt = await ocean.unstakeOcean(
        accountId,
        currentStakePool.address,
        toFixed18(recieveAmounts.oceanAmount),
        currentStakePool.shares
      );

      if (txReceipt) {
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
          stakeAmt: removeAmount,
          txReceipt,
        });
        setRecentTxHash(
          ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash
        );
        setShowConfirmLoader(false);
        setShowTxDone(true);
        setBgLoading([...bgLoading, bgLoadingStates.allStakedPools]);
        setPoolDataFromOcean({
          accountId,
          ocean,
          chainId,
          setBgLoading,
          bgLoading,
          setNoStakedPools,
          setAllStakedPools,
        });
      } else {
        setShowConfirmLoader(false);
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
    } catch (error) {
      console.error(error);
      setShowConfirmLoader(false);
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

  async function setMaxUnstake() {
    setBgLoading([...bgLoading, bgLoadingStates.maxUnstake]);

    let maxUnstake;

    //find how much can possible be removed from pool
    const maxPossibleUnstake = await ocean.getMaxUnstakeAmount(
      currentStakePool.address,
      ocean.config.default.oceanTokenAddress
    );

    //find whether user staked oceans is greater or lesser than max unstake
    const userTotalStakedTokens = await ocean.getTokensRemovedforPoolShares(
      currentStakePool.address,
      currentStakePool.shares
    );

    //find no. of shares needed to unstake the lesser token amount from above
    if (
      Number(maxPossibleUnstake) > Number(userTotalStakedTokens.oceanAmount)
    ) {
      maxUnstake = Number(userTotalStakedTokens.oceanAmount).toFixed(18);
      setRecieveAmounts(userTotalStakedTokens);
    } else {
      maxUnstake = maxPossibleUnstake;
      setRecieveAmounts({ dtAmount: "0", oceanAmount: maxPossibleUnstake });
    }

    // https://github.com/dataxfi/datax.js/blob/main/src/Ocean.ts#L930 is this function needed? It returns the number of shares to remove a particular amount of tokens
    // console.log("Shares needed", ocean.getPoolSharesRequiredToUnstake(currentStakePool.address, ocean.config.default.oceanTokenAddress, maxPossibleUnstake))

    //update unstake amount (removeAmount) with the possible max unstake for a user
    setRemoveAmount(maxUnstake);

    //calculate removePercent from remove amount
    const maxUnstakePerc =
      (Number(maxUnstake) / Number(userTotalStakedTokens.oceanAmount)) * 100;
    setRemovePercent(toFixed5(Number(maxUnstakePerc)));
    setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.maxUnstake));
  }

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
                  <input
                    step="1"
                    onChange={(e) => updateNum(e.target.value)}
                    onWheel={(event) => event.currentTarget.blur()}
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-"].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    type="number"
                    className="h-full w-14 rounded-lg bg-primary-900 text-2xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400 text-left"
                    placeholder="0.0"
                    value={removePercent}
                  />
                  <p className="text-type-300 text-2xl">%</p>
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
                        {toFixed5(recieveAmounts.oceanAmount) || 0}
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
                onClick={handleWithdrawal}
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
        show={showConfirmLoader}
        close={() => setShowConfirmLoader(false)}
        txs={
          currentStakePool
            ? [
                `Approve DataX to unstake ${toFixed5(
                  recieveAmounts.oceanAmount
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
    </>
  ) : null;
};

export default RemoveAmount;
