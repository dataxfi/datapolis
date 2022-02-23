import { AiOutlinePlus } from "react-icons/ai";
import StakeSelect from "./StakeSelect";
// import PositionBox from "./PositionBox"
import { useState, useContext, useEffect } from "react";
import { bgLoadingStates, GlobalContext, removeBgLoadingState } from "../context/GlobalState";
import { MoonLoader } from "react-spinners";
import Button from "./Button";
import ConfirmModal from "./ConfirmModal";
import TransactionDoneModal from "./TransactionDoneModal";
import { Link, useLocation } from "react-router-dom";
import UserMessage from "./UserMessage";
import { toFixed5 } from "../utils/equate";
import { addTxHistory, deleteRecentTxs } from "../utils/txHistoryUtils";
import { getLocalPoolData, updateSingleStakePool } from "../utils/stakedPoolsUtils";
import usePTxManager from "../hooks/usePTxManager";
import useTxModalToggler from "../hooks/useTxModalToggler";
import errorMessages from "../utils/errorMessages";
import useCurrentPool from "../hooks/useCurrentPool";
import BigNumber from "bignumber.js";
import { DebounceInput } from "react-debounce-input";
import WrappedInput from "./WrappedInput";
import UnlockTokenModal from "./UnlockTokenModal";
import { IToken, IUserMessage } from "../utils/types";
import useWatchLocation from "../hooks/useWatchLocation";
import { getAllowance } from "../hooks/useTokenList";
import { IPoolLiquidity, IBtnProps } from "../utils/types";
import {TokenInfo } from "@dataxfi/datax.js/dist/TokenList"

const text = {
  T_STAKE: "Stake",
  T_SELECT_TOKEN: "Select token",
};

const INITIAL_BUTTON_STATE = {
  text: "Connect wallet",
  classes: "",
  disabled: false,
};

const Stake = () => {
  const {
    ocean,
    accountId,
    chainId,
    handleConnect,
    tokenModalArray,
    currentStakeToken,
    txHistory,
    setTxHistory,
    showConfirmModal,
    setShowConfirmModal,
    showTxDone,
    setShowTxDone,
    setAllStakedPools,
    notifications,
    setNotifications,
    bgLoading,
    setBgLoading,
    setShowUnlockTokenModal,
    loading,
    setLoading,
  } = useContext(GlobalContext);
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [dtToOcean, setDtToOcean] = useState<any>(null);
  const [oceanToDt, setOceanToDt] = useState<any>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [oceanValToStake, setOceanValToStake] = useState<BigNumber>(new BigNumber(0));
  const [txReceipt, setTxReceipt] = useState<any | null>(null);
  const [balance, setBalance] = useState<BigNumber>(new BigNumber(0));
  const [loadingStake, setLoadingStake] = useState(false);
  const [recentTxHash, setRecentTxHash] = useState("");
  const [btnProps, setBtnProps] = useState<IBtnProps>(INITIAL_BUTTON_STATE);
  const [userMessage, setUserMessage] = useState<IUserMessage | false>(false);
  const [poolAddress, setPoolAddress] = useState<string>("");

  //very last transaction
  const [lastTxId, setLastTxId] = useState<any>(null);
  const [oceanToken, setOceanToken] = useState<IToken>({
    value: oceanValToStake,
    balance,
    percentage: new BigNumber(0),
    loading: false,
    info: {
      symbol: "OCEAN",
      name: "Ocean Token",
      decimals: 18,
      logoURI: "https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY",
      tags: ["oceantoken"],
      chainId: "",
      address: "",
      pool: "",
    },
  });
  //const [perc, setPerc] = useState("");
  const [poolLiquidity, setPoolLiquidity] = useState<IPoolLiquidity | null>(null);
  const [yourLiquidity, setYourLiquidity] = useState<BigNumber>(new BigNumber(0));
  const [yourShares, setYourShares] = useState<BigNumber>(new BigNumber(0));
  const [maxStakeAmt, setMaxStakeAmt] = useState<BigNumber>(new BigNumber(0));

  const location = useLocation();

  //hooks
  usePTxManager(lastTxId);
  useTxModalToggler(txReceipt, setTxReceipt);
  useCurrentPool({ poolAddress, setPoolAddress, setToken });
  useWatchLocation();

  async function getMaxStakeAmt() {
    if (token && ocean)
      return new BigNumber(await ocean.getMaxStakeAmount(token.pool, ocean.config.default.oceanTokenAddress)).dp(5);
  }

  async function setOceanBalance() {
    if (accountId && ocean && setLoading) {
      const OCEAN_ADDRESS = ocean.config.default.oceanTokenAddress.toLowerCase();
      setLoading(true);
      try {
        const balance = new BigNumber(await ocean.getBalance(OCEAN_ADDRESS, accountId));
        setBalance(balance);
      } catch (error) {
        console.error("Error when trying to fetch Balance");
      }

      setLoading(false);
    }
  }

  useEffect(() => {
    if (ocean && token) {
      getMaxStakeAmt()
        .then((res: BigNumber | void) => {
          if (res) {
            setMaxStakeAmt(res);
            if (oceanValToStake?.gt(1)) {
              updateNum(oceanValToStake, res);
            }
          }
        })
        .catch(console.error);

      if (token.pool && accountId && chainId)
        getAllowance(ocean.config.default.oceanTokenAddress, accountId, token.pool, ocean).then((res) => {
          console.log(res);
          if (oceanToken.info)
            setOceanToken({
              ...oceanToken,
              info: {
                ...oceanToken.info,
                chainId,
                address: ocean.config.default.oceanTokenAddress,
              },
              allowance: new BigNumber(res),
            });
        });
    }
    // setOceanValInput(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean, token, tokenModalArray]);

  useEffect(() => {
    if (txReceipt && setShowConfirmModal && setShowTxDone) {
      console.log("A succesful txReceipt has been set in Stake\n", txReceipt);
      if (showConfirmModal) {
        setShowConfirmModal(false);
        setShowTxDone(true);
      }
    }
    setOceanBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txReceipt]);

  useEffect(() => {
    setToken(null);
    setOceanValToStake(new BigNumber(0));
    setOceanBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId]);

  useEffect(() => {
    // regular expresssions and URLSearchParams are not supported IE
    const queryParams = new URLSearchParams(location.search);
    const poolAddress = queryParams.get("pool");

    if (accountId && tokenModalArray) {
      if (currentStakeToken) {
        updateToken(currentStakeToken);
        setUserMessage(false);
      } else if (poolAddress && tokenModalArray.length > 0) {
        const currentToken = tokenModalArray.find((token: { pool: string }) => token.pool === poolAddress);
        updateToken(currentToken);
        setUserMessage(false);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenModalArray, accountId]);

  useEffect(() => {
    if (!loadingStake) {
      updateToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingStake]);

  useEffect(() => {
    if (!accountId) {
      setBtnProps(INITIAL_BUTTON_STATE);
    } else if (!token) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Select a Token",
        disabled: true,
      });
    } else if (!oceanValToStake || oceanValToStake.eq(0)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Enter OCEAN Amount",
        disabled: true,
      });
    } else if (balance?.eq(0) || (balance && oceanValToStake.gt(balance))) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Not Enough OCEAN Balance",
        disabled: true,
      });
    } else if (loadingStake) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Processing Transaction...",
        disabled: true,
      });
    } else if (oceanValToStake.isLessThan(0.01)) {
      setBtnProps({
        ...INITIAL_BUTTON_STATE,
        text: "Minimum Stake is .01 OCEAN",
        disabled: true,
      });
    } else if (oceanToken.allowance?.lt(oceanValToStake)) {
      setBtnProps({
        ...btnProps,
        text: "Unlock OCEAN",
        disabled: false,
      });
    } else {
      setBtnProps({
        ...btnProps,
        disabled: false,
        text: "Stake",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ocean, chainId, token, oceanValToStake, balance, loadingStake, oceanToken]);

  async function executeStake() {
    let txDateId;
    if (!token || !chainId || !txHistory || !setTxHistory || !ocean || !accountId) return;
    try {
      setLoadingStake(true);
      txDateId = addTxHistory({
        chainId,
        setTxHistory,
        txHistory,
        accountId: String(accountId),
        token1: token,
        token2: oceanToken,
        txType: "stake",
        status: "pending",
        stakeAmt: oceanValToStake?.toFixed(5),
      });
      setLastTxId(txDateId);
      console.log(accountId, token.pool, oceanValToStake?.toString());
      const txReceipt = await ocean.stakeOcean(accountId, token.pool, oceanValToStake?.toString());

      if (txReceipt) {
        setToken(null);
        setOceanValToStake(new BigNumber(0));
        setTxReceipt(txReceipt);
        addTxHistory({
          chainId,
          setTxHistory,
          txHistory,
          accountId: String(accountId),
          token1: token,
          token2: oceanToken,
          txType: "stake",
          txDateId,
          txHash: txReceipt.transactionHash,
          status: "indexing",
          stakeAmt: oceanValToStake?.toFixed(5),
          txReceipt,
        });
        if (token.pool && setAllStakedPools) {
          const json = JSON.parse(getLocalPoolData(accountId, chainId) || "[]");
          updateSingleStakePool({
            ocean,
            accountId,
            localData: json,
            poolAddress: token.pool,
            setAllStakedPools,
          });
        }

        setRecentTxHash(ocean.config.default.explorerUri + "/tx/" + txReceipt.transactionHash);
        setLoadingStake(false);
        if (setShowConfirmModal) setShowConfirmModal(false);
        // setOceanValInput(null);
      } else {
        throw new Error("Didn't receive a receipt.");
      }
    } catch (error: any) {
      console.error(error);
      if (notifications) {
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
        deleteRecentTxs({
          txDateId,
          setTxHistory,
          txHistory,
          accountId,
          chainId,
        });
      }
      setLoadingStake(false);
      if (setShowConfirmModal) setShowConfirmModal(false);
      // setOceanValInput(null);
      setOceanValToStake(new BigNumber(0));
    }
  }

  async function setMaxStake() {
    if (!token || !ocean) return;
    console.log(ocean);
    let maxStake: BigNumber | null;
    maxStakeAmt
      ? (maxStake = maxStakeAmt)
      : (maxStake = new BigNumber(await ocean.getMaxStakeAmount(token.pool, ocean.config.default.oceanTokenAddress)));
    console.log("Max Stake Amount - ", maxStake.toFixed(18));
    if (maxStake.isNaN()) {
      setOceanValToStake(new BigNumber(0));
    } else {
      console.log(2);
      if (balance?.lt(maxStake)) {
        setOceanValToStake(balance.dp(5));
      } else {
        setOceanValToStake(maxStake.dp(5).minus(1));
      }
    }
  }

  // async function onPerc(val: any) {
  //   const perc = parseFloat(val);
  //   if (!Number.isNaN(val)) {
  //     setPerc(String(perc));
  //     setOceanVal(toFixed((balance * perc) / 100));
  //   } else {
  //     setPerc("");
  //     setOceanVal("");
  //   }
  // }

  async function updateNum(val: string | BigNumber, max?: BigNumber) {
    //initially set state to value to persist the max if the user continuously tries to enter over the max (or balance)

    setOceanValToStake(new BigNumber(val));
    if (!val) {
      setOceanValToStake(new BigNumber(0));
      return;
    }
    val = new BigNumber(val);

    if (!max) {
      maxStakeAmt.gt(0) ? (max = maxStakeAmt) : (max = await getMaxStakeAmt());
    }

    if (max) {
      if (balance.lt(val)) {
        setOceanValToStake(balance.dp(5));
      } else if (max.minus(1).lt(val)) {
        setOceanValToStake(max.dp(5).minus(1));
      } else {
        setOceanValToStake(val);
      }
    }
    if (setBgLoading && bgLoading) setBgLoading(removeBgLoadingState(bgLoading, bgLoadingStates.calcTrade));
  }

  async function updateToken(val: any) {
    if (!accountId || !ocean) return;
    setToken(val);
    if (val) {
      setLoadingRate(true);
      const [res1, res2, myPoolShares, totalPoolShares] = await Promise.all([
        ocean?.getOceanPerDt(val.pool),
        ocean?.getDtPerOcean(val.pool),
        ocean?.getMyPoolSharesForPool(val.pool, accountId),
        ocean?.getTotalPoolShares(val.pool),
      ]);
      setYourShares(new BigNumber(myPoolShares));
      setOceanToDt(res1);
      setDtToOcean(res2);

      setYourLiquidity(new BigNumber(await ocean.getOceanRemovedforPoolShares(val.pool, myPoolShares)));
      const { dtAmount, oceanAmount } = await ocean.getTokensRemovedforPoolShares(val.pool, String(totalPoolShares));
      setPoolLiquidity({ dtAmount: new BigNumber(dtAmount), oceanAmount: new BigNumber(oceanAmount) });
      setLoadingRate(false);
    }
  }

  return (
    <div className="w-full h-full absolute top-0">
      <div className="flex h-full w-full items-center justify-center">
        <div>
          <div
            id="stakeModal"
            className="lg:w-107 lg:mx-auto sm:mx-4 mx-3 bg-black bg-opacity-90 rounded-lg p-3 hm-box"
          >
            <div className="flex justify-between">
              {userMessage && userMessage.type === "error" ? (
                <UserMessage
                  message={userMessage.message}
                  pulse={true}
                  container={false}
                  timeout={{ showState: setUserMessage, time: 5000 }}
                />
              ) : userMessage && userMessage.type === "message" ? (
                <UserMessage message={userMessage.message} pulse={true} container={false} timeout={null} />
              ) : null}
            </div>
            <StakeSelect
              token={token}
              setToken={(val: any) => {
                updateToken(val);
              }}
            />
            <div className="px-4 relative mt-6 mb-10">
              <div className="rounded-full border-black border-4 absolute -top-7 bg-trade-darkBlue w-12 h-12 flex items-center justify-center swap-center">
                {loading ? (
                  <MoonLoader size={25} color={"white"} />
                ) : (
                  <AiOutlinePlus size="30" className="text-gray-300" />
                )}
              </div>
            </div>
            <div className="modalSelectBg p-2 rounded-lg">
              <div className="md:grid md:grid-cols-5">
                <div className="col-span-2 grid grid-flow-col gap-4 justify-start items-center">
                  <img
                    src="https://gateway.pinata.cloud/ipfs/QmY22NH4w9ErikFyhMXj9uBHn2EnuKtDptTnb7wV6pDsaY"
                    className="w-10 h-10 rounded-md"
                    alt=""
                  />
                  <div>
                    <p className="text-xs text-type-200">Token</p>
                    <span className="xs:text-sm sm:text-2xl text-type-200 font-bold grid grid-flow-col items-center gap-1">
                      <span className="text-sm sm:text-lg">OCEAN</span>
                    </span>
                  </div>
                </div>
                <div className="col-span-3 mt-3 md:mt-0 bg-black bg-opacity-70 rounded-lg p-1">
                  <div className="flex justify-between items-center">
                    {/* https://stackoverflow.com/a/58097342/6513036 and https://stackoverflow.com/a/62275278/6513036 */}
                    <DebounceInput
                      id="stakeAmtInput"
                      debounceTimeout={500}
                      value={oceanValToStake?.toString() || ""}
                      onChange={(e) => updateNum(e.target.value)}
                      onWheel={(event: any) => event.currentTarget.blur()}
                      onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()}
                      type="number"
                      className={`w-full rounded-lg mr-1 bg-black bg-opacity-0 text-2xl px-2 outline-none focus:placeholder-type-200 placeholder-type-400 ${
                        token ? "text-white" : "text-gray-500"
                      }`}
                      placeholder="0.0"
                      disabled={!token}
                      element={WrappedInput}
                    />
                    <div>
                      <p id="oceanBalance" className="text-sm text-type-400 whitespace-nowrap text-right mb-1">
                        Balance: {balance ? balance.toFixed(3) : "-"}
                      </p>

                      <div className="text-sm text-type-300 grid grid-flow-col justify-end gap-2">
                        <Button
                          onClick={() => {
                            setMaxStake();
                          }}
                          id="maxStake"
                          text="Max Stake"
                          classes={`px-2 py-0 lg:w-20 border rounded-full text-xs ${
                            balance?.isNaN() || balance?.eq(0) || !accountId || !token
                              ? "text-gray-600 border-gray-600"
                              : "border-type-300 hover:bg-primary-600"
                          }`}
                          disabled={balance && accountId && token ? false : true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border border-type-600 mt-4 rounded-lg p-2 w-full">
              <div className="my-1 mr-4">
                <p className="text-type-300 text-xs">Swap Rate</p>
                {token && oceanToDt && dtToOcean && !loadingRate ? (
                  <div id="swapRate">
                    <p className="text-type-200 text-xs">
                      {toFixed5(oceanToDt)} OCEAN per {token.symbol}
                    </p>
                    <p className="text-type-200 text-xs">
                      {toFixed5(dtToOcean)} {token.symbol} per OCEAN
                    </p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
              <div className="my-1 mr-4">
                <p className="text-type-300 text-xs">Pool liquidity</p>
                {token && poolLiquidity && !loadingRate ? (
                  <div id="poolLiquidity">
                    <p className="text-type-200 text-xs">{toFixed5(poolLiquidity?.oceanAmount)} OCEAN</p>
                    <p className="text-type-200 text-xs">
                      {toFixed5(poolLiquidity?.dtAmount)} {token.symbol}
                    </p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
              <div className="my-1">
                <p className="text-type-300 text-xs">Your liquidity</p>
                {token && yourLiquidity && !loadingRate ? (
                  <div id="yourLiquidity">
                    <p className="text-type-200 text-xs">{yourShares.dp(5).toString()} Shares</p>
                    <p className="text-type-200 text-xs">{yourLiquidity.dp(5).toString()} OCEAN</p>
                  </div>
                ) : (
                  <div> - </div>
                )}
              </div>
            </div>
            <Button
              id="executeStake"
              text={btnProps.text}
              onClick={() => {
                if (btnProps.text === "Connect wallet") {
                  if (handleConnect) handleConnect();
                } else {
                  if (oceanToken.allowance?.lt(oceanValToStake)) {
                    if (setShowUnlockTokenModal) setShowUnlockTokenModal(true);
                  } else {
                    if (setShowConfirmModal) setShowConfirmModal(true);
                    executeStake();
                  }
                }
              }}
              classes="p-2 rounded-lg w-full mt-4 txButton"
              disabled={btnProps.disabled}
            />
          </div>
          <div className="pt-3 pl-6 lg:pl-3">
            <Link id="lpLink" to="/stake/list" className="text-gray-300 hover:text-gray-100 transition-colors">
              View your stake positions {">"}
            </Link>
          </div>
        </div>
      </div>
      <UnlockTokenModal
        token1={{ ...oceanToken, value: oceanValToStake }}
        token2={{
          value: "0",
          info: token,
          balance,
          loading: false,
          percentage: new BigNumber(0),
          allowance: new BigNumber(0),
        }}
        setToken={setOceanToken}
        nextFunction={() => {
          if (setShowConfirmModal) setShowConfirmModal(true);
          executeStake();
        }}
      />

      <ConfirmModal
        show={showConfirmModal ? showConfirmModal : false}
        close={() => {
          if (setShowConfirmModal) setShowConfirmModal(false);
        }}
        txs={token ? [`Stake ${oceanValToStake?.decimalPlaces(5).toString()} OCEAN in ${token.symbol} pool`] : []}
      />
      <TransactionDoneModal
        show={showTxDone ? showTxDone : false}
        txHash={recentTxHash}
        close={() => {
          if (setShowTxDone) setShowTxDone(false);
        }}
      />

      {userMessage && userMessage.type === "alert" ? (
        <UserMessage
          message={userMessage}
          pulse={false}
          container={false}
          timeout={{ showState: setUserMessage, time: 5000 }}
        />
      ) : null}
      {/* <PositionBox />  */}
    </div>
  );
};

export default Stake;
